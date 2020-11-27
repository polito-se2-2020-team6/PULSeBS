<?php
require_once "../functions.php";
require_once "../vendor/autoload.php";

require_once "./StatsBookings.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

define("API_PATH", $_SERVER["SCRIPT_NAME"] . "/api");

/* Constant defining */

define("USER_TYPE_STUDENT", 0);
define("USER_TYPE_TEACHER", 1);

define('LECTURE_PRESENCE', 0x0);
define('LECTURE_REMOTE', 0x1);
define('LECTURE_CANCELLED', 0x2);

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
	function do_login($vars) {
		try {
			$pdo = new PDO("sqlite:../db.sqlite");

			$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE username = :username");
			$stmt->bindValue(":username", $_POST["username"]);

			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			$user_data = $stmt->fetch();

			if (!password_verify($_POST["password"], $user_data["password"])) {
				http_response_code(403);
				echo json_encode(array('success' => false));
				return;
			} else {
				//TODO da trasformare in un vero nonce da salvare nel db
				$nonce = md5(serialize($user_data));

				$_SESSION['user_id'] = $user_data["ID"];
				$_SESSION['nonce'] = $nonce;

				echo json_encode(array("success" => true, "userId" =>
				$user_data['ID'], 'type' => $user_data['type']));

				return;
			}
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if (!function_exists('am_i_logged')) {
	function am_i_logged() {
		if (!check_login()) {
			http_response_code(403);
			echo json_encode(array('success' => true, 'loggedIn' => false));
		} else
			echo json_encode(array('success' => true, 'loggedIn' => true));
	}
}

if (!function_exists('do_logout')) {
	function do_logout($vars) {
		unset($_SESSION['nonce']);
		unset($_SESSION['user_id']);

		echo json_encode(array('success' => true));
	}
}

if (!function_exists('list_lectures')) {

	function list_lectures($vars) {

		$userId = intval($vars['userId']);
		$pdo = new PDO("sqlite:../db.sqlite");

		// Get type of user
		$stmt = $pdo->prepare('SELECT * FROM users WHERE ID = :userId');
		$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}
		$userData = $stmt->fetch();

		if (!$userData) {
			// User doesn't exist, but is logged in ❓❓❓
			echo json_encode(array('success' => false));
			return;
		}

		$userType = intval($userData['type']);

		$query = 'SELECT * FROM lectures L';

		// Allow only for 0 (student) and 1 (teacher)
		if ($userType == 0) { // Student
			$query .= ', course_subscriptions CS WHERE L.course_id = CS.Course_id AND CS.user_id = :userId';
		} else if ($userType == 1) { // Teacher
			$query .= ', courses C WHERE C.ID = L.course_id AND C.teacher_id = :userId';
		} else { // Everyone else
			// Not authorized
			echo json_encode(array('success' => false));
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
				echo json_encode(array('success' => false));
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

			$bookedSeats = $stmt_inner->fetch();
			if (!$bookedSeats) {
				// wtf does this even mean?
				echo json_encode(array('success' => false));
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
					echo json_encode(array('success' => false));
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
					echo json_encode(array('success' => false));
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
		echo json_encode(array('success' => true, 'lectures' => $lectures));
	}
}


if (!function_exists('print_types')) {
	function print_types($vars) {
		echo json_encode(array('success' => true, 'list' => array(
			array("typeId" => USER_TYPE_STUDENT, 'typeDesc' => 'student'),
			array("typeId" => USER_TYPE_TEACHER, 'typeDesc' => 'teacher')
		)));
	}
}

if (!function_exists('print_myself')) {
	function print_myself($vars) {
		try {
			$pdo = new PDO("sqlite:../db.sqlite");

			$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE ID = :userId");
			$stmt->bindValue(":userId", $_SESSION["user_id"], PDO::PARAM_INT);

			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			$user_data = $stmt->fetch();

			echo json_encode(array(
				'success' => true,
				'userId' => intval($user_data['ID']),
				'type' => intval($user_data['type']),
				'username' => $user_data['username'],
				'email' => $user_data['email'],
				'firstname' => $user_data['firstname'],
				'lastname' => $user_data['lastname'],
			));
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if (!function_exists('cancel_lecture')) {
	function cancel_lecture($vars) {
		$lectureId = intval($vars['lectureId']);

		try {
			if (!isset($_SESSION['user_id'])) {
				throw new PDOException('');
			}

			$userId = intval($_SESSION['user_id']);
			$pdo = new PDO('sqlite:../db.sqlite');

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
			$stmt = $pdo->prepare('SELECT ID, email, firstname, lastname
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
			while ($s = $stmt->fetch()) {
				$students[] = array(
					'studentId' => intval($s['ID']),
					'email' => $s['email'],
					'studentName' => $s['lastname'] . ' ' . $s['firstname']
				);
			}

			// Cancel lecture
			$stmt = $pdo->prepare('UPDATE lectures
								   SET settings = settings | :cancelled
								   WHERE ID = :lectureId');
			$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
			$stmt->bindValue(':lecture', $lectureId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			//send mail notifications
			$lecture_time = new DateTime($lecture["start_ts"], new DateTimeZone("UTC"));
			$lecture_time->setTimezone(new DateTimeZone($server_default_timezone));
			foreach ($students as $student) {
				mail($student["email"], "Cancellation of " . $lecture['name'] . " lecture of " . $lecture_time->format("Y-m-d H:i"), "The lecture of the course " . $lecture['name'] . " that should had taken place in " . $lecture_time->format("D Y-m-d H:i") . " has been cancelled\nKind regards");
			}
			// Success
			echo json_encode(array('success' => true));
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if (!function_exists('booked_students')) {
	function booked_students($vars) {
		$lectureId = intval($vars['lectureId']);
		$userId = intval($_SESSION['user_id']);

		try {
			$pdo = new PDO("sqlite:../db.sqlite");

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
			$stmt = $pdo->prepare('SELECT ID, email, firstname, lastname
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
			while ($s = $stmt->fetch()) {
				$student = array(
					'studentId' => intval($s['ID']),
					'email' => $s['email'],
					'studentName' => $s['lastname'] . ' ' . $s['firstname']
				);

				array_push($students, $student);
			}

			// Send stuff
			echo json_encode(array('success' => true, 'students' => $students));
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
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
			$pdo = new PDO("sqlite:../db.sqlite");

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
								   VALUES (:lectureId, :userId, :bookingTs, NULL, 0) ON CONFLICT (lecture_id, user_id) DO UPDATE SET cancellation_ts = NULL');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':bookingTs', $now, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			// Success
			//I send a confirmazion email
			$mail_result = mail($user_data["email"], "Confirmation of " . $lecture["name"] . " lecture booking", "You did a booking for the lecture of " . $lecture["name"] . ". The booking has been successfull");
			if (!$mail_result) {
				echo json_encode(array('success' => true, 'mailSent' => $mail_result, 'mailError' => error_get_last()));
			} else {
				echo json_encode(array('success' => true, 'mailSent' => $mail_result));
			}
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage(), 'line' => $e->getLine()));
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

			$pdo = new PDO('sqlite:../db.sqlite');

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
								   FROM lectures L, bookings B
								   WHERE L.ID = B.lecture_id
									   AND L.ID = :lectureId
									   AND L.start_ts > :currentTs
									   AND B.user_id = :userId
									   AND cancellation_ts IS NULL');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':currentTs', $now, PDO::PARAM_INT);	// Check for timezones discrepancies
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
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

			// Success
			echo json_encode(array('success' => true));
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
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
	$r->addRoute('POST', API_PATH . '/logout', ['do_logout', NEED_AUTH]);
	$r->addRoute('GET', API_PATH . "/types", "print_types");

	/* users route */
	$r->addRoute('GET', API_PATH . '/user/me', ['print_myself', NEED_AUTH]);

	$r->addRoute('GET', API_PATH . '/users/{userId:\d+}/lectures', ['list_lectures', NEED_AUTH]);
	$r->addRoute('DELETE', API_PATH . '/lectures/{lectureId:\d+}', ['cancel_lecture', NEED_AUTH]);
	$r->addRoute('GET', API_PATH . '/lectures/{lectureId:\d+}/students', ['booked_students', NEED_AUTH]);
	$r->addRoute('DELETE', API_PATH . '/users/{userId:\d+}/book', ['cancel_booking', NEED_AUTH]);
	$r->addRoute('POST', API_PATH . '/users/{userId:\d+}/book', ['book_lecture', NEED_AUTH]);

	$r->addRoute('GET', API_PATH . '/stats', ['stats_bookings']);
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
							echo json_encode(array('success' => false, 'reason' => 'Authentication required'));
						}
						break;
					default:
						break;
				}
				if (!$ok) break;
			}
			if (!$ok) break;

			if ($httpMethod == 'DELETE') {
				parse_str(file_get_contents("php://input"), $_DELETE);
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
