<?php
require_once "../functions.php";
require_once "../vendor/autoload.php";

require_once "./StatsBookings.php";
require_once "upload_functions/UploadCourses.php";
require_once "upload_functions/UploadEnrollements.php";
require_once "upload_functions/UploadStudents.php";
require_once "upload_functions/UploadTeachers.php";
require_once "upload_functions/UploadSchedule.php";
require_once "./GetStudentInfo.php";
require_once "./GetContactTracingReport.php";
require_once "./RecordAttendace.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

define("API_PATH", $_SERVER["SCRIPT_NAME"] . "/api");


/* Turning warning and notices into exceptions */

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
	// error was suppressed with the @-operator
	if (0 === error_reporting()) {
		return false;
	}

	throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

/* Functions that implements endpoints */

if (!function_exists("do_login")) {
	function do_login() {
		try {
			$pdo = new PDO(DB_PATH);

			$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE username = :username");
			$stmt->bindValue(":username", $_POST["username"]);

			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			$user_data = $stmt->fetch();

			if (!password_verify($_POST["password"], $user_data["password"])) {
				http_response_code(403);
				echo json_encode(array('success' => false), JSON_INVALID_UTF8_SUBSTITUTE);
				return;
			} else {
				//TODO da trasformare in un vero nonce da salvare nel db
				$nonce = md5(serialize($user_data));

				$_SESSION['user_id'] = $user_data["ID"];
				$_SESSION['nonce'] = $nonce;

				echo json_encode(array("success" => true, "userId" =>
				$user_data['ID'], 'type' => intval($user_data['type'])));

				return;
			}
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('am_i_logged')) {
	function am_i_logged() {
		if (!check_login()) {
			http_response_code(403);
			echo json_encode(array('success' => true, 'loggedIn' => false), JSON_INVALID_UTF8_SUBSTITUTE);
		} else {
			echo json_encode(array('success' => true, 'loggedIn' => true), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('do_logout')) {
	function do_logout() {
		unset($_SESSION['nonce']);
		unset($_SESSION['user_id']);

		echo json_encode(array('success' => true), JSON_INVALID_UTF8_SUBSTITUTE);
	}
}

if (!function_exists('list_lectures')) {

	function list_lectures($vars) {

		$userId = intval($vars['userId']);
		$pdo = new PDO(DB_PATH);

		// Get type of user
		$userData = get_myself();

		$userType = intval($userData['type']);

		$query = 'SELECT * FROM lectures L';

		// Allow only for 0 (student) and 1 (teacher)
		if ($userType == 0) { // Student
			$query .= ', course_subscriptions CS WHERE L.course_id = CS.Course_id AND CS.user_id = :userId';
		} else if ($userType == 1) { // Teacher
			$query .= ', courses C WHERE C.ID = L.course_id AND C.teacher_id = :userId';
		} else { // Everyone else
			// Not authorized
			echo json_encode(array('success' => false), JSON_INVALID_UTF8_SUBSTITUTE);
			return;
		}

		// Filter out cancelled lectures
		$query .= ' AND settings & :cancelled = 0';

		// Add optional ranges to query
		if (isset($_GET['startDate'])) {
			$query .= ' AND start_ts >= :startDate';
		}
		if (isset($_GET['endDate'])) {
			$query .= ' AND start_ts <= :endDate';
		}

		// Get list of lectures, ordered
		$query .= ' ORDER BY start_ts, ID ASC';
		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
		$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);

		if (isset($_GET['startDate'])) {
			$Ymd = explode('-', $_GET['startDate']);
			$ts = mktime(0, 0, 0, intval($Ymd[1]), intval($Ymd[2]), intval($Ymd[0]));
			$stmt->bindValue(':startDate', $ts, PDO::PARAM_INT);
		}
		if (isset($_GET['endDate'])) {
			$Ymd = explode('-', $_GET['endDate']);
			$ts = mktime(59, 59, 23, intval($Ymd[1]), intval($Ymd[2]), intval($Ymd[0]));
			$stmt->bindValue(':endDate', $ts, PDO::PARAM_INT);
		}

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$lectures = array();
		while ($l = $stmt->fetch()) {
			$lecture = array(
				'lectureId' => intval($l['0']),
				'courseId' => intval($l['course_id']),
				'startTS' => intval($l['start_ts']),
				'endTS' => intval($l['end_ts']),
				'online' => boolval($l['settings'] & LECTURE_REMOTE),
			);

			// Get roomName, totalSeats
			$stmt_inner = $pdo->prepare('SELECT * FROM rooms WHERE ID = :roomId');
			$stmt_inner->bindValue(':roomId', intval($l['room_id']), PDO::PARAM_INT);

			if (!$stmt_inner->execute()) {
				throw new PDOException($stmt_inner->errorInfo(), $stmt_inner->errorCode());
			}

			$room = $stmt_inner->fetch();
			if (!$room) {
				// Room does not exist
				echo json_encode(array('success' => false), JSON_INVALID_UTF8_SUBSTITUTE);
				return;
			}

			$lecture['roomName'] = $room['name'];
			$lecture['totalSeats'] = intval($room['seats']);

			// Compute bookedSeats
			$stmt_inner = $pdo->prepare('SELECT COUNT(*) AS n_bookings FROM bookings WHERE lecture_id = :lectureId AND cancellation_ts IS NULL');
			$stmt_inner->bindValue(':lectureId', $lecture['lectureId'], PDO::PARAM_INT);

			if (!$stmt_inner->execute()) {
				throw new PDOException($stmt_inner->errorInfo(), $stmt_inner->errorCode());
			}

			$lecture["inWaitingList"] = check_user_in_waiting_list($lecture["lectureId"]);

			$bookedSeats = $stmt_inner->fetch();
			if (!$bookedSeats) {
				// wtf does this even mean?
				echo json_encode(array('success' => false), JSON_INVALID_UTF8_SUBSTITUTE);
				return;
			}

			$lecture['bookedSeats'] = intval($bookedSeats['n_bookings']);

			// Get courseName, teacherName
			if ($userType == 1) {
				$lecture['courseName'] = $l['name'];
				$lecture['teacherName'] = $userData['lastname'] . ' ' . $userData['firstname'];
			} else {
				$stmt_inner = $pdo->prepare('SELECT * FROM courses WHERE ID = :courseId');
				$stmt_inner->bindValue(':courseId', $lecture['courseId'], PDO::PARAM_INT);

				if (!$stmt_inner->execute()) {
					throw new PDOException($stmt_inner->errorInfo(), $stmt_inner->errorCode());
				}

				$course = $stmt_inner->fetch();
				if (!$course) {
					// Course does not exist
					echo json_encode(array('success' => false), JSON_INVALID_UTF8_SUBSTITUTE);
					return;
				}

				$lecture['courseName'] = $course['name'];

				$stmt_inner = $pdo->prepare('SELECT * FROM users WHERE ID = :teacherId');
				$stmt_inner->bindValue(':teacherId', intval($course['teacher_id']), PDO::PARAM_INT);

				if (!$stmt_inner->execute()) {
					throw new PDOException($stmt_inner->errorInfo(), $stmt_inner->errorCode());
				}

				$teacher = $stmt_inner->fetch();
				if (!$teacher || intval($teacher['type']) !== 1) {
					// Teacher does not exist, or is not a teacher
					echo json_encode(array('success' => false), JSON_INVALID_UTF8_SUBSTITUTE);
					return;
				}

				// Compute bookedSelf
				if ($userType == 1) { // Teacher
					// Cannot book lectures, always false
					$lectures['bookedSelf'] = false;
				} else {
					$stmt_inner = $pdo->prepare('SELECT * FROM bookings WHERE lecture_id = :lectureId AND cancellation_ts IS NULL AND user_id == :userId');
					$stmt_inner->bindValue(':lectureId', $lecture['lectureId'], PDO::PARAM_INT);
					$stmt_inner->bindValue(':userId', $userId, PDO::PARAM_INT);

					if (!$stmt_inner->execute()) {
						throw new PDOException($stmt_inner->errorInfo(), $stmt_inner->errorCode());
					}

					$lecture['bookedSelf'] = boolval($stmt_inner->fetch());
				}

				$lecture['teacherName'] = $teacher['lastname'] . ' ' . $teacher['firstname'];
			}

			array_push($lectures, $lecture);
		}

		// Send stuff
		echo json_encode(array('success' => true, 'lectures' => $lectures), JSON_INVALID_UTF8_SUBSTITUTE);
	}
}

if (!function_exists('list_lectures_by_course')) {

	function list_lectures_by_course($vars) {
		$courseId = intval($vars['courseId']);
		try {
			$startDate = isset($_GET['startDate']) ? (new DateTime($_GET['startDate']))->getTimestamp() : null;
			$endDate = isset($_GET['endDate']) ? (new DateTime($_GET['endDate']))->getTimestamp() : null;
			echo json_encode(array('success' => true) + get_lectures_by_course($courseId, $startDate, $endDate), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists("update_lectures_schedule_by_course")) {
	function update_lectures_schedule_by_course($vars) {
		global $_PATCH;

		$weekdays = array(
			0 => "Sunday",
			1 => "Monday",
			2 => "Tuesday",
			3 => "Wednesday",
			4 => "Thursday",
			5 => "Friday",
			6 => "Saturday",
		);

		$courseId = intval($vars['courseId']);
		try {
			$pdo = new PDO("sqlite:../db.sqlite");

			// Get type of user
			$userData = get_myself();


			$userType = intval($userData['type']);

			if ($userType != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}
			//retrieve the weekdays, formatting as sqlite strftime expects it (0 = sunday, 6 = saturday)
			$original_weekday = (intval($_PATCH["originalWeekday"]) + 1) % 7;
			$new_weekday = (intval($_PATCH["newWeekday"]) + 1) % 7;
			$difference = $new_weekday - $original_weekday;
			$sign = $difference >= 0 ? "+" : "";

			$range_conditions = "";
			// Add optional ranges to query
			if (isset($_PATCH['startDateTime'])) {
				$startDateTime = new DateTime($_PATCH["startDateTime"]);
				if ($startDateTime < new DateTime()) {
					throw new ErrorException("startDateTime cannot be in the past");
				}
			} else {
				$startDateTime = new DateTime();
			}
			$startDateString = $startDateTime->format("Y-m-d H:i");
			$range_conditions .= ' AND start_ts >= ' . $startDateTime->getTimestamp();
			if (isset($_PATCH['endDateTime'])) {
				$endDateTime = new DateTime($_PATCH["endDateTime"]);
				$range_conditions .= ' AND start_ts <= ' . $endDateTime->getTimestamp();
				if ($startDateTime >= $endDateTime) {
					throw new ErrorException("endDateTime cannot be before startDateTime");
				}
				$endDateString = $endDateTime->format("Y-m-d H:i");
			} else {
				$endDateTime = null;
				$endDateString = null;
			}

			$lectures = get_lectures_by_course($courseId, $startDateString, $endDateString);

			if (!isset($_PATCH["newTime"])) {
				$sql = "UPDATE lectures SET start_ts = strftime('%s', start_ts, 'unixepoch', '" . $sign . $difference . " days'),end_ts = strftime('%s', end_ts, 'unixepoch', '" . $sign . $difference . " days') WHERE strftime('%w', start_ts, 'unixepoch') = :originalWeekday AND course_id=:courseId " . $range_conditions;
				$stmt = $pdo->prepare($sql);
				$stmt->bindValue(":courseId", $courseId, PDO::PARAM_INT);
				$stmt->bindValue(":originalWeekday", $original_weekday, PDO::PARAM_STR);

				if (!$stmt->execute()) {
					throw new PDOException($stmt->errorInfo()[2]);
				}

				$affectedRows = $stmt->rowCount();
				//retrieving students to which send the mails
				if ($affectedRows > 0) {
					$students = array();
					foreach ($lectures["lectures"] as $lecture) {
						$students = array_merge($students, get_students_booked_by_lecture($lecture["lectureId"]));
					}

					foreach ($students as $student) {
						$text_message = "Mr./Mrs. " . $student["studentName"] . ",\nThe lectures of the course " . $lectures["courseName"] . "(" . $lectures["courseCode"] . ") that were held on " . $weekdays[$original_weekday] . " has been reschedule to " . $weekdays[$new_weekday] . ". The time has been unchanged and the changes will apply from " . $startDateString;
						@mail(
							$student["email"],
							"Rescheduling of lectures for \"" . $lectures["courseName"] . "\"",
							$text_message
						);
					}
				}
			} else {
				$timeDatas = explode(":", $_PATCH["newTime"]);
				if (count($timeDatas) != 2 || !is_numeric($timeDatas[0]) || !is_numeric($timeDatas[1])) {
					throw new ErrorException("Wrong time format, should be hh:mm");
				}
				$hh = intval($timeDatas[0]);
				$mm = intval($timeDatas[1]);

				$pdo->beginTransaction();

				$affectedRows = 0;
				$students = array();
				foreach ($lectures["lectures"] as $lecture) {
					$cur_start_time = new DateTime('@' . $lecture["startTS"]);
					if (intval($cur_start_time->format("w")) != $original_weekday) continue;
					$cur_end_time = new DateTime('@' . $lecture["endTS"]);
					$lecture_duration = $cur_end_time->getTimestamp() - $cur_start_time->getTimestamp();

					$cur_start_time->modify($sign . $difference . " days");
					$cur_start_time->setTime($hh, $mm);
					$cur_end_time->modify($sign . $difference . " days");
					$cur_end_time->setTime($hh, $mm);
					$cur_end_time->modify("+" . $lecture_duration . " seconds");

					$stmt = $pdo->query("UPDATE lectures SET start_ts = " . $cur_start_time->getTimestamp() . ", end_ts = " . $cur_end_time->getTimestamp() . " WHERE ID = " . $lecture["lectureId"] . $range_conditions);

					if (!$stmt) {
						$pdo->rollback();
						throw new PDOException($pdo->errorInfo()[2]);
					}
					$thisLecturesAffecting = $stmt->rowCount();
					if ($thisLecturesAffecting > 0) {
						$students = array_merge($students, get_students_booked_by_lecture($lecture["lectureId"]));
					}
					$affectedRows += $thisLecturesAffecting;
				}

				$pdo->commit();
				//sending rescheduling email
				foreach ($students as $student) {
					$text_message = "Mr./Mrs. " . $student["studentName"] . ",\nThe lectures of the course " . $lectures["courseName"] . "(" . $lectures["courseCode"] . ") that were held on " . $weekdays[$original_weekday] . " has been reschedule to " . $weekdays[$new_weekday] . " at " . $_PATCH["newTime"] . ". The changes will apply from " . $startDateString;
					@mail(
						$student["email"],
						"Rescheduling of lectures for \"" . $lectures["courseName"] . "\"",
						$text_message
					);
				}
			}

			echo json_encode(array('success' => true, 'affectedRow' => $affectedRows), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage(), 'line' => $e->getLine()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('print_types')) {
	function print_types() {
		echo json_encode(array('success' => true, 'list' => array(
			array("typeId" => USER_TYPE_STUDENT, 'typeDesc' => 'student'),
			array("typeId" => USER_TYPE_TEACHER, 'typeDesc' => 'teacher')
		)));
	}
}

if (!function_exists('print_myself')) {
	function print_myself() {
		try {
			echo json_encode(get_myself(), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('cancel_lecture')) {
	function cancel_lecture($vars) {
		global $server_default_timezone;
		$lectureId = intval($vars['lectureId']);

		try {
			if (!isset($_SESSION['user_id'])) {
				throw new PDOException('');
			}

			$userId = intval($_SESSION['user_id']);
			$pdo = new PDO(DB_PATH);

			// Check user exists and is teacher
			$stmt = $pdo->prepare('SELECT * FROM users WHERE ID = :userId AND type = :teacher');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':teacher', USER_TYPE_TEACHER, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$stmt->fetch()) {
				throw new PDOException('Teacher ' . $userId . ' not found.');
			}

			// Check lecture exists, is assigned to teacher and > 1h to start
			$nextHour = new DateTime();
			$nextHour->modify('+1 hour'); // Check for timezones discrepancies
			//TODO check because this method doesn't take into account legal hour shift. You should use the method setTimezone
			$stmt = $pdo->prepare('SELECT *
								   FROM lectures L, courses C
								   WHERE L.course_id = C.ID
									   AND L.ID = :lectureId
									   AND C.teacher_id = :userId
									   AND settings & :cancelled = 0
									   AND L.start_ts > :nextHour');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
			$stmt->bindValue(':nextHour', $nextHour->getTimestamp(), PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$lecture = $stmt->fetch()) {
				throw new PDOException('Lecture ' . $lectureId . ' not found.');
			}

			// Get students
			$students = get_students_booked_by_lecture($lectureId);

			// Cancel lecture
			$stmt = $pdo->prepare('UPDATE lectures
								   SET settings = settings | :cancelled
								   WHERE ID = :lectureId');
			$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			//send mail notifications
			$lecture_time = new DateTime();
			$lecture_time->setTimestamp(intval($lecture["start_ts"]));
			$lecture_time->setTimezone(new DateTimeZone($server_default_timezone));
			foreach ($students as $student) {
				@mail($student["email"], "Cancellation of " . $lecture['name'] . " lecture of " . $lecture_time->format("Y-m-d H:i"), "The lecture of the course " . $lecture['name'] . " that should had taken place in " . $lecture_time->format("D Y-m-d H:i") . " has been cancelled\nKind regards");
			}
			// Success
			echo json_encode(array('success' => true), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('booked_students')) {
	function booked_students($vars) {
		$lectureId = intval($vars['lectureId']);
		$userId = intval($_SESSION['user_id']);

		try {
			$pdo = new PDO(DB_PATH);

			// Check user is indeed a teacher
			$stmt = $pdo->prepare('SELECT type FROM users WHERE ID = :userId');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			$user = $stmt->fetch();
			if (!$user || $user['type'] != intval(USER_TYPE_TEACHER)) {
				throw new PDOException('Teacher' . $userId . ' not found.');
			}

			// Check lecture is assigned to course of teacher
			$stmt = $pdo->prepare('SELECT COUNT(*) 
								   FROM lectures L, courses C 
								   WHERE L.course_id = C.ID 
								   		AND L.ID = :lectureId 
										AND C.teacher_id = :userId');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$stmt->fetch()) {
				throw new PDOException('Lecture' . $lectureId . ' not found.');
			}


			// Get students
			$stmt = $pdo->prepare('SELECT ID, email, firstname, lastname, attended
								   FROM users U, bookings B
								   WHERE U.ID = B.user_id 
								   		AND lecture_id = :lectureId
								   		AND type = :student 
										AND booking_ts IS NOT NULL
										AND cancellation_ts IS NULL');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':student', intval(USER_TYPE_STUDENT), PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			$students = array();
			//get waiting list
			$waiting_list = get_waiting_list_by_lecture($lectureId);

			while ($s = $stmt->fetch()) {
				$studentId = intval($s['ID']);
				$student = array(
					'studentId' => $studentId,
					'email' => $s['email'],
					'studentName' => $s['lastname'] . ' ' . $s['firstname'],
					'inWaitingList' => in_array($studentId, $waiting_list),
					'attended' => boolval($s['attended'])
				);

				array_push($students, $student);
			}

			// Send stuff
			echo json_encode(array('success' => true, 'students' => $students), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('book_lecture')) {
	function book_lecture($vars) {
		$userId = intval($vars['userId']);

		try {
			if (!isset($_POST['lectureId'])) {
				throw new PDOException('Expected lectureId parameter.');
			}

			$lectureId = intval($_POST['lectureId']);
			$pdo = new PDO(DB_PATH);

			// Check user exists and is student
			$stmt = $pdo->prepare('SELECT * FROM users WHERE ID = :userId AND type = :student');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':student', USER_TYPE_STUDENT, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			$user_data = $stmt->fetch();
			if (!$user_data) {
				throw new PDOException('Student ' . $userId . ' not found.');
			}

			// Check lecture exists and deadline for booking is not met (23.00 of day before)
			$stmt = $pdo->prepare('SELECT *
								   FROM lectures, courses
								   WHERE lectures.ID = :lectureId
								   		AND courses.ID = lectures.course_id 
										AND settings & :cancelled = 0');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			$lecture = $stmt->fetch();
			if (!$lecture) {
				throw new PDOException('Lecture ' . $lectureId . ' not found.');
			}

			// Check for timezones discrepancies
			$bookingDeadline = new DateTime();
			$bookingDeadline->setTimestamp(intval($lecture['start_ts']));
			$bookingDeadline->modify('-1 day')->setTime(23, 0, 0);
			$now = time();

			if ($now >= $bookingDeadline->getTimestamp()) {
				throw new PDOException('Booking s for lecture ' . $lectureId . ' are closed.');
			}

			// Check student is following the course of the lecture
			$stmt = $pdo->prepare('SELECT *
								   FROM lectures L, course_subscriptions CS
								   WHERE L.course_id = CS.course_id
									   AND L.ID = :lectureId
									   AND user_id = :userId');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$stmt->fetch()) {
				throw new PDOException('Student ' . $userId . ' is not following course of lecture ' . $lectureId . '.');
			}

			// Check student is not currently booked
			$stmt = $pdo->prepare('SELECT * 
								   FROM bookings 
								   WHERE user_id = :userId
										   AND lecture_id = :lectureId
										   AND cancellation_ts IS NULL');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if ($stmt->fetch()) {
				throw new PDOException('Student ' . $userId . ' has already booked for lecture ' . $lectureId . '.');
			}


			// Book to lecture
			$stmt = $pdo->prepare('INSERT INTO bookings (lecture_id, user_id, booking_ts, cancellation_ts, attended) 
								   VALUES (:lectureId, :userId, :bookingTs, NULL, 0) ON CONFLICT (lecture_id, user_id) DO UPDATE SET cancellation_ts = NULL, booking_ts = :bookingTs');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':bookingTs', $now, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			// Success
			$in_wait_list = check_user_in_waiting_list($lectureId);
			//I send a confirmation email
			$mail_subject = "Confirmation of " . $lecture["name"] . " lecture booking";
			$mail_body = "You succesfully booked for the lecture of " . $lecture["name"] . "." . ($in_wait_list ? " The room is currently at full capacity, you have been placed in a waiting list." : "");
			$mail_result = @mail($user_data["email"], $mail_subject, $mail_body);
			if (!$mail_result) {
				echo json_encode(array('success' => true, 'inWaitingList' => $in_wait_list, 'mailSent' => $mail_result, 'mailError' => error_get_last()), JSON_INVALID_UTF8_SUBSTITUTE);
			} else {
				echo json_encode(array('success' => true, 'inWaitingList' => $in_wait_list, 'mailSent' => $mail_result,), JSON_INVALID_UTF8_SUBSTITUTE);
			}
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage(), 'line' => $e->getLine()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('cancel_booking')) {
	function cancel_booking($vars) {
		global $_DELETE;

		$userId = intval($vars['userId']);

		try {
			if (!isset($_DELETE['lectureId'])) {
				throw new PDOException('Expected lectureId parameter.');
			}

			$lectureId = intval($_DELETE['lectureId']);

			//getting the next in line to notify later
			$next_waiting_student = get_waiting_list_by_lecture($lectureId, 1);
			$is_cancelling_user_in_waiting_list = check_user_in_waiting_list($lectureId, $userId);

			$pdo = new PDO(DB_PATH);

			// Check user exists and is student
			$stmt = $pdo->prepare('SELECT * FROM users WHERE ID = :userId AND type = :student');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':student', USER_TYPE_STUDENT, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$stmt->fetch()) {
				throw new PDOException('Student ' . $userId . ' not found.');
			}

			// Check lecture exists, is in future and is booked by student
			$now = time();
			$stmt = $pdo->prepare('SELECT * 
								   FROM lectures L, bookings B, courses C
								   WHERE L.ID = B.lecture_id
								       AND L.course_id = C.ID
									   AND L.ID = :lectureId
									   AND L.start_ts > :currentTs
									   AND B.user_id = :userId
									   AND cancellation_ts IS NULL');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':currentTs', $now, PDO::PARAM_INT);	// Check for timezones discrepancies
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);

			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$lecture = $stmt->fetch()) {
				throw new PDOException('Lecture ' . $userId . ' not found.');
			}

			// Delete (via update)
			$stmt = $pdo->prepare('UPDATE bookings 
								   SET cancellation_ts = :currentTs 
								   WHERE user_id = :userId 
									   AND lecture_id = :lectureId');
			$stmt->bindValue(':currentTs', $now, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			//notifying the next student in line, if any
			if (!empty($next_waiting_student) && !$is_cancelling_user_in_waiting_list) {
				$student_info = get_user($next_waiting_student[0]);
				$start_time = new DateTime("@" . $lecture['start_ts']);
				@mail($student_info['email'], "Moving out of waiting list for " . $lecture['name'], "You have been moved out from waiting list for the lecture of " . $lecture['name'] . " scheduled for " . $start_time->format("Y-m-d h:i"));
			}

			// Success
			echo json_encode(array('success' => true), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('set_mass_lecture_online_status')) {
	function set_mass_lecture_online_status() {
		global $_PATCH, $server_default_timezone;
		$status = $_PATCH['value'] == 'true' ? LECTURE_REMOTE : ~LECTURE_REMOTE;
		$years = isset($_PATCH["year"]) ? $_PATCH["year"] : array();
		$semesters = isset($_PATCH["semester"]) ? $_PATCH["semester"] : array();
		$start_time = isset($_PATCH["start_date"]) ? new DateTime($_PATCH["start_date"], new DateTimeZone($server_default_timezone)) : new DateTime();
		$end_time = isset($_PATCH["end_date"]) ? new DateTime($_PATCH["end_date"], new DateTimeZone($server_default_timezone)) : null;
		try {
			if (!isset($_SESSION['user_id'])) {
				throw new ErrorException('Auth Needed');
			}

			$pdo = new PDO('sqlite:../db.sqlite');

			// Check user exists and is teacher
			$user = get_myself();
			if ($user["type"] != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException('Wrong logged user type');
			}

			//Prepare the query
			$sql = "UPDATE lectures ";

			// Set lecture status
			if ($status == LECTURE_REMOTE) {
				$sql .= "SET settings = settings | :online ";
			} else {
				$sql .= "SET settings = settings & :online ";
			}

			$sql .= " WHERE start_ts >= :startTime";

			if (!empty($years) || !(empty($semesters))) {
				$sql .= " AND course_id IN (SELECT ID FROM courses WHERE ";
				//parse because i cannot bind value before prepare
				//years
				$conditions = array_map(function ($el) {
					if (!is_numeric($el)) return false;
					return "year = " . intval($el);
				}, $years);
				//remove some falses;
				$conditions = array_filter($conditions);
				$year_subsql = implode(" OR ", $conditions);
				//semesters
				$conditions2 = array_map(function ($el) {
					if (!is_numeric($el)) return false;
					return "semester = " . intval($el);
				}, $semesters);
				$conditions2 = array_filter($conditions2);
				$semester_subsql = implode(" OR ", $conditions2);

				if ($semester_subsql != "" && $year_subsql != "") {
					$sql .= "(" . $year_subsql . ") AND (" . $semester_subsql . ")";
				} else {
					$sql .= $year_subsql . $semester_subsql;
				}

				$sql .= ")";
			}

			if (null !== $end_time) {
				$sql .= " AND start_ts <= " . $end_time->getTimestamp();
			}
			$stmt = $pdo->prepare($sql);
			$stmt->bindValue(':online', $status, PDO::PARAM_INT);
			$stmt->bindValue(':startTime', $start_time->getTimestamp(), PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			// Success
			echo json_encode(array('success' => true, "affectedRecords" => $stmt->rowCount()), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('set_lecture_online_status')) {
	function set_lecture_online_status($vars) {
		global $_PATCH;
		$lectureId = intval($vars['lectureId']);
		$status = $_PATCH['value'] == 'true' ? LECTURE_REMOTE : ~LECTURE_REMOTE;

		try {
			if (!isset($_SESSION['user_id'])) {
				throw new ErrorException('Auth Needed');
			}

			$userId = intval($_SESSION['user_id']);
			$pdo = new PDO(DB_PATH);

			// Check user exists and is teacher
			$stmt = $pdo->prepare('SELECT * FROM users WHERE ID = :userId AND type = :teacher');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':teacher', USER_TYPE_TEACHER, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$stmt->fetch()) {
				throw new PDOException('Teacher ' . $userId . ' not found.');
			}

			// Check lecture exists, is assigned to teacher and > 30m to start
			$nextHour = new DateTime('now', new DateTimeZone('UTC'));
			$nextHour->modify('+30 minutes'); // Check for timezones discrepancies
			$stmt = $pdo->prepare('SELECT *
								   FROM lectures L, courses C
								   WHERE L.course_id = C.ID
									   AND L.ID = :lectureId
									   AND C.teacher_id = :userId
									   AND L.start_ts > :nextHour');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':nextHour', $nextHour->getTimestamp(), PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			if (!$stmt->fetch()) {
				throw new PDOException('Lecture ' . $lectureId . ' not found.');
			}

			// Set lecture status
			if ($status == LECTURE_REMOTE) {
				$stmt = $pdo->prepare('UPDATE lectures
								   SET settings = settings | :online
								   WHERE ID = :lectureId');
			} else {
				$stmt = $pdo->prepare('UPDATE lectures
								   SET settings = settings & :online
								   WHERE ID = :lectureId');
			}
			$stmt->bindValue(':online', $status, PDO::PARAM_INT);
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			// Success
			echo json_encode(array('success' => true), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('print_courses')) {
	function print_courses() {
		try {
			$pdo = new PDO(DB_PATH);

			if (isset($_GET["ofLogged"])) {
				$logged_user = get_myself();
				switch ($logged_user["type"]) {
					case USER_TYPE_TEACHER:
						$stmt = $pdo->prepare("SELECT courses.*, users.firstname AS teacherFirstName, users.lastname AS teacherLastName, users.email AS teacherEmail, users.ID AS teacherId FROM courses, users WHERE courses.teacher_id = users.ID AND courses.teacher_id = :teacherID");

						$stmt->bindValue(":teacherID", $logged_user["userId"]);

						if (!$stmt->execute()) {
							throw new PDOException($stmt->errorInfo()[2]);
						}

						$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
						break;
					case USER_TYPE_STUDENT:
						$stmt = $pdo->prepare("SELECT courses.*, users.firstname AS teacherFirstName, users.lastname AS teacherLastName, users.email AS teacherEmail, users.ID AS teacherId FROM courses, users WHERE courses.teacher_id = users.ID AND courses.ID IN ( SELECT course_id FROM course_subscriptions WHERE user_id = :studentID)");

						$stmt->bindValue(":studentID", $logged_user["userId"]);

						if (!$stmt->execute()) {
							throw new PDOException($stmt->errorInfo()[2]);
						}

						$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
						break;
					default:
						throw new ErrorException("Your user type does not have assigned courses");
						break;
				}
			} else {
				$stmt = $pdo->query("SELECT courses.*, users.firstname AS teacherFirstName, users.lastname AS teacherLastName, users.email AS teacherEmail, users.ID AS teacherId FROM courses, users WHERE courses.teacher_id = users.ID");

				if (!$stmt) {
					throw new PDOException($pdo->errorInfo()[2]);
				}

				$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
			}

			echo json_encode(array("success" => true, "courses" => $courses), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage(), 'line' => $e->getLine()), JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

/*Documentation for FastRoute can be found here: https://github.com/nikic/FastRoute */

/*Constants to define option for the routes*/

define("NEED_AUTH", 0); //if set, the route needs $_SESSION['nonce'] to be set and valid

//define the routes
$dispatcher = FastRoute\simpleDispatcher(function (FastRoute\RouteCollector $r) {
	$r->addRoute('POST', API_PATH . '/login', 'do_login');
	$r->addRoute('GET', API_PATH . '/logged', 'am_i_logged');
	$r->addRoute('POST', API_PATH . '/logout', 'do_logout');
	$r->addRoute('GET', API_PATH . "/types", "print_types");

	/* courses routes */
	$r->addRoute('GET', API_PATH . "/courses", "print_courses");
	$r->addRoute('GET', API_PATH . "/courses/{courseId:\d+}/lectures", ["list_lectures_by_course", NEED_AUTH]);
	$r->addRoute('PATCH', API_PATH . "/courses/{courseId:\d+}/schedule", ["update_lectures_schedule_by_course", NEED_AUTH]);

	/* users route */
	$r->addRoute('GET', API_PATH . '/user/me', ['print_myself', NEED_AUTH]);

	$r->addRoute('GET', API_PATH . '/users/{userId:\d+}/lectures', ['list_lectures', NEED_AUTH]);
	$r->addRoute('DELETE', API_PATH . '/lectures/{lectureId:\d+}', ['cancel_lecture', NEED_AUTH]);
	$r->addRoute('GET', API_PATH . '/lectures/{lectureId:\d+}/students', ['booked_students', NEED_AUTH]);
	$r->addRoute('PATCH', API_PATH . '/lectures/{lectureId:\d+}/online', ['set_lecture_online_status', NEED_AUTH]);
	$r->addRoute('PATCH', API_PATH . '/lectures/online', ['set_mass_lecture_online_status', NEED_AUTH]);
	$r->addRoute('DELETE', API_PATH . '/users/{userId:\d+}/book', ['cancel_booking', NEED_AUTH]);
	$r->addRoute('POST', API_PATH . '/users/{userId:\d+}/book', ['book_lecture', NEED_AUTH]);

	$r->addRoute('GET', API_PATH . '/stats', ['stats_bookings', NEED_AUTH]);

	$r->addRoute('POST', API_PATH . '/courses/upload', ['upload_courses', NEED_AUTH]);
	$r->addRoute('POST', API_PATH . '/enrollments/upload', ['upload_enrollments', NEED_AUTH]);
	$r->addRoute('POST', API_PATH . '/students/upload', ['upload_students', NEED_AUTH]);
	$r->addRoute('POST', API_PATH . '/teachers/upload', ['upload_teachers', NEED_AUTH]);
	$r->addRoute('POST', API_PATH . '/schedules/upload', ['upload_schedules', NEED_AUTH]);

	$r->addRoute('GET', API_PATH . '/students/{code:.+}/{field:id|ssn}', ['get_student_info', NEED_AUTH]);
	$r->addRoute('GET', API_PATH . '/users/{userId:\d+}/CTReport/{format:...}', ['get_contact_report', NEED_AUTH]);
	$r->addRoute('PATCH', API_PATH . '/lectures/{lectureId:\d+}/students/{studentId:\d+}', ['record_attendance', NEED_AUTH]);
});

// Fetch method and URI from somewhere
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Strip query string (?foo=bar) and decode URI
if (false !== $pos = strpos($uri, '?')) {
	$uri = substr($uri, 0, $pos);
}
$uri = rawurldecode($uri);

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
	case FastRoute\Dispatcher::NOT_FOUND:
		http_response_code(404);
		break;
	case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
		$allowedMethods = $routeInfo[1];
		http_response_code(405);
		// ... 405 Method Not Allowed
		break;
	case FastRoute\Dispatcher::FOUND:
		if (!is_array($routeInfo[1])) {
			$handler = $routeInfo[1];
			$vars = $routeInfo[2];
			$handler($vars);
		} else {
			$ok = true;
			for ($i = 1; $i < count($routeInfo[1]); $i++) {
				switch ($routeInfo[1][$i]) {
					case NEED_AUTH:
						if (!check_login()) {
							$ok = false;
							http_response_code(403);
							echo json_encode(array('success' => false, 'reason' => 'Authentication required'), JSON_INVALID_UTF8_SUBSTITUTE);
						}
						break;
					default:
						break;
				}
				if (!$ok) {
					break;
				}
			}
			if (!$ok) {
				break;
			}

			if ($httpMethod == 'DELETE') {
				parse_str(file_get_contents("php://input"), $_DELETE);
			} else if ($httpMethod == 'PATCH') {
				parse_str(file_get_contents("php://input"), $_PATCH);
			}
			$handler = $routeInfo[1][0];
			$vars = $routeInfo[2];
			$handler($vars);
		}
		break;
	default:
		http_response_code(404);
		break;
}
