<?php
session_start();
$server_default_timezone = date_default_timezone_get();  //needed to know which timezone the server uses
date_default_timezone_set("UTC");

/* Constant defining */

define("USER_TYPE_STUDENT", 0);
define("USER_TYPE_TEACHER", 1);
define("USER_TYPE_BOOK_MNGR", 2);
define("USER_TYPE_SPRT_OFCR", 3);

define('LECTURE_REMOTE', 0x1);
define('LECTURE_CANCELLED', 0x2);
/* Utilities */

if (!function_exists("check_login")) {
	/**
	 * Check if a user is logged
	 * 
	 * @return bool true if is logged, false otherwise
	 */
	function check_login() {
		$pdo = new PDO("sqlite:../db.sqlite");

		if (!isset($_SESSION["user_id"]) || !isset($_SESSION["nonce"])) {
			return false;
		}

		$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE ID = :userId");
		$stmt->bindValue(":userId", $_SESSION["user_id"], PDO::PARAM_INT);


		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$user_data = $stmt->fetch();


		return $_SESSION["nonce"] == md5(serialize($user_data)) && intval($_SESSION['user_id']) == intval($user_data['ID']);
	}
}

if (!function_exists("get_seats_by_lecture")) {
	function get_seats_by_lecture($lecture_id) {
		$pdo = new PDO("sqlite:../db.sqlite");

		//get the seats number
		$stmt = $pdo->prepare("SELECT seats FROM lectures, rooms WHERE lectures.room_id = rooms.ID AND lectures.ID = :lectureId");
		$stmt->bindValue(":lectureId", $lecture_id, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$seats = $stmt->fetchColumn();

		if ($seats === false) {
			throw new ErrorException("Cannot retrieve number of seats");
		}

		return intval($seats);
	}
}

if (!function_exists("check_user_in_waiting_list")) {
	function check_user_in_waiting_list($lecture_id, $user_id = null) {
		$seats = get_seats_by_lecture($lecture_id);
		$user_id = $user_id === null ? $_SESSION["user_id"] : $user_id;

		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT user_id FROM (
				SELECT user_id FROM bookings WHERE lecture_id = :lectureId AND cancellation_ts IS NULL ORDER BY booking_ts ASC LIMIT :seats
			) AS t WHERE t.user_id = :userId");

		$stmt->bindValue(":userId", $user_id, PDO::PARAM_INT);
		$stmt->bindValue(":lectureId", $lecture_id, PDO::PARAM_INT);
		$stmt->bindValue(":seats", $seats, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		return false === $stmt->fetch();
	}
}


if (!function_exists("get_waiting_list_by_lecture")) {
	function get_waiting_list_by_lecture($lecture_id, $limit = -1) {
		$seats = get_seats_by_lecture($lecture_id);

		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT user_id FROM bookings WHERE lecture_id = :lectureId AND cancellation_ts IS NULL ORDER BY booking_ts ASC LIMIT :limit OFFSET :seats");

		$stmt->bindValue(":lectureId", $lecture_id, PDO::PARAM_INT);
		$stmt->bindValue(":seats", $seats, PDO::PARAM_INT);
		$stmt->bindValue(":limit", $limit, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$waitlist = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

		if ($waitlist === false) $waitlist = array();
		else if (!is_array($waitlist)) $waitlist = array($waitlist);
		return $waitlist;
	}
}

if (!function_exists('get_list_of_teachers')) {
	function get_list_of_teachers() {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare('SELECT ID FROM users WHERE type = :teacher');
		$stmt->bindValue(':teacher', USER_TYPE_TEACHER, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$teacherList = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

		if ($teacherList === false) {
			$teacherList = array();
		} else if (!is_array($teacherList)) {
			$teacherList = array($teacherList);
		}

		return $teacherList;
	}
}

if (!function_exists('get_list_of_students')) {
	function get_list_of_students() {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare('SELECT ID FROM users WHERE type = :student');
		$stmt->bindValue(':student', USER_TYPE_STUDENT, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$studentList = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

		if ($studentList === false) {
			$studentList = array();
		} else if (!is_array($studentList)) {
			$studentList = array($studentList);
		}

		return $studentList;
	}
}

if (!function_exists('get_list_of_course_codes')) {
	function get_list_of_course_codes() {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare('SELECT ID, code FROM courses');

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$codesList = $stmt->fetchAll(PDO::FETCH_ASSOC);

		if ($codesList === false) {
			$codesList = array();
		} else if (!is_array($codesList)) {
			$codesList = array($codesList);
		}

		// [
		//   "CODE" => "ID",
		//   ...	
		// ]
		return array_combine(array_column($codesList, 'code'), array_column($codesList, 'ID'));
	}
}

if (!function_exists('get_list_of_rooms')) {
	function get_list_of_rooms() {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare('SELECT ID FROM rooms');

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$roomsList = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

		if ($roomsList === false) {
			$roomsList = array();
		} else if (!is_array($roomsList)) {
			$roomsList = array($roomsList);
		}

		return $roomsList;
	}
}

if (!function_exists("get_myself")) {
	function get_myself() {
		if (!isset($_SESSION["user_id"]) || !isset($_SESSION["nonce"])) {
			return false;
		}

		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT * FROM users WHERE ID = :userId");
		$stmt->bindValue(":userId", $_SESSION["user_id"], PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$user_data = $stmt->fetch();

		return array(
			'success' => true,
			'userId' => intval($user_data['ID']),
			'type' => intval($user_data['type']),
			'username' => $user_data['username'],
			'email' => $user_data['email'],
			'firstname' => $user_data['firstname'],
			'lastname' => $user_data['lastname'],
			'city' => $user_data['city'],
			'birthday' => $user_data['birthday'],
			'SSN' => $user_data['SSN'],
		);
	}
}

if (!function_exists("get_user")) {
	function get_user($id) {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT ID, type, username, email, firstname, lastname, city, birthday, SSN FROM users WHERE ID = :userId");
		$stmt->bindValue(":userId", $id, PDO::PARAM_INT);


		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$user_data = $stmt->fetch();

		if (!$user_data) {
			throw new ErrorException("User not found.");
		}

		return array(
			'success' => true,
			'userId' => intval($user_data['ID']),
			'type' => intval($user_data['type']),
			'username' => $user_data['username'],
			'email' => $user_data['email'],
			'firstname' => $user_data['firstname'],
			'lastname' => $user_data['lastname'],
			'city' => $user_data['city'],
			'birthday' => $user_data['birthday'],
			'SSN' => $user_data['SSN'],
		);
	}
}

if (!function_exists("get_user_by_ssn")) {
	function get_user_by_ssn($ssn) {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT ID, type, username, email, firstname, lastname, city, birthday, SSN FROM users WHERE SSN = :SSN");
		$stmt->bindValue(":SSN", $ssn, PDO::PARAM_STR);


		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$user_data = $stmt->fetch();

		if (!$user_data) {
			throw new ErrorException("User not found.");
		}

		return array(
			'success' => true,
			'userId' => intval($user_data['ID']),
			'type' => intval($user_data['type']),
			'username' => $user_data['username'],
			'email' => $user_data['email'],
			'firstname' => $user_data['firstname'],
			'lastname' => $user_data['lastname'],
			'city' => $user_data['city'],
			'birthday' => $user_data['birthday'],
			'SSN' => $user_data['SSN'],
		);
	}
}

if (!function_exists('getContactInformation')) {
	function getContactInformation($id, $timestamp) {

		$contactQuery = <<<'EOC'
SELECT
	U.ID as `ID`,
	U.firstname as `First Name`,
	U.lastname as `Last Name`,
	U.city as `City`,
	U.birthday as `Birthday`,
	U.SSN as `SSN`,
	U.email as `Email`,
	MAX(L.end_ts) as `Last Contact`
FROM
	bookings B,
	users U,
	lectures L
WHERE B.user_id = U.ID
	AND B.lecture_id = L.ID
	AND lecture_id IN (
		SELECT lecture_id
		FROM bookings
		WHERE user_id = :userId
			AND attended = 1
			AND cancellation_ts IS NULL
	)
	AND user_id <> :userId
	AND start_ts < :ts
	AND start_ts >= :twoweeksago
	AND B.cancellation_ts IS NULL
	AND B.attended = 1
GROUP BY U.ID, U.firstname, U.lastname, U.city, U.birthday, U.SSN, U.email
ORDER BY `Last Contact` DESC;
EOC;

		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare($contactQuery);
		$stmt->bindValue(":userId", $id, PDO::PARAM_INT);
		$stmt->bindValue(":ts", $timestamp, PDO::PARAM_INT);
		// Limit to midnight of 14 days before
		$twoweeksago = ($timestamp - (2 * 7 * 24 * 60 * 60)) - ($timestamp % (24 * 60 * 60));
		$stmt->bindValue(':twoweeksago', $twoweeksago, PDO::PARAM_INT);


		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$contact_info = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$mapContactInfo = function ($r) {

			$dt = new DateTime();
			$dt->setTimestamp(intval($r['Last Contact']));
			return [
				'ID' => intval($r['ID']),
				'First name' => $r['First Name'],
				'Last name' => $r['Last Name'],
				'City' => $r['City'],
				'Birthday' => $r['Birthday'],
				'SSN' => $r['SSN'],
				'Email' => $r['Email'],
				'Last contact' => $dt->format('Y-m-d H:i eO')
			];
		};

		$columnNames = [];
		$i = 0;
		while ($i < $stmt->columnCount()) {
			$meta = $stmt->getColumnMeta($i);
			array_push($columnNames, $meta['name']);
			$i++;
		}

		return array_merge([$columnNames], array_map($mapContactInfo, $contact_info));
	}
}

if (!function_exists('get_lecture')) {
	function get_lecture($lectureId) {
		$query = <<<'EOC'
SELECT
	ID as lectureId,
	course_id as courseId,
	room_id as roomId,
	start_ts as startTs,
	end_ts as endTs,
	settings as settings
FROM
	lectures
WHERE
	ID = :lectureId
EOC;

		$pdo = new PDO('sqlite:../db.sqlite');
		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':lectureId', intval($lectureId), PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$lectureData = $stmt->fetch();

		return array(
			'success' => true,
			'lectureId' => intval($lectureData['lectureId']),
			'courseId' => intval($lectureData['courseId']),
			'roomId' => intval($lectureData['roomId']),
			'startTs' => intval($lectureData['startTs']),
			'endTs' => intval($lectureData['endTs']),
			'settings' => intval($lectureData['settings']),
		);
	}
}

if (!function_exists('get_course_from_lecture')) {
	function get_course_from_lecture($lectureId) {
		$query = <<<'EOC'
SELECT
	C.ID as courseId,
	C.code as code,
	C.name as name,
	C.teacher_id as teacherId,
	C.year as year,
	C.semester as semester
FROM
	lectures L, courses C
WHERE
	L.course_id = C.ID AND
	L.ID = :lectureId
EOC;

		$pdo = new PDO('sqlite:../db.sqlite');
		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':lectureId', intval($lectureId), PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$courseData = $stmt->fetch();

		return array(
			'success' => true,
			'courseId' => intval($courseData['courseId']),
			'code' => $courseData['code'],
			'name' => $courseData['name'],
			'teacherId' => intval($courseData['teacherId']),
			'year' => intval($courseData['year']),
			'semester' => intval($courseData['semester']),
		);
	}
}

if (!function_exists('is_student_booked')) {
	function is_student_booked_no_waitlist($studentId, $lectureId) {
		$query = <<<'EOC'
SELECT 
	COUNT(*) as isBooked
FROM
	users U, bookings B
WHERE
	U.ID = B.user_id AND
	lecture_id = :lectureId AND
	type = :student AND
	B.user_id = :studentId AND
	booking_ts IS NOT NULL AND
	cancellation_ts IS NULL
EOC;

		$pdo = new PDO('sqlite:../db.sqlite');
		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':lectureId', intval($lectureId), PDO::PARAM_INT);
		$stmt->bindValue(':student', USER_TYPE_STUDENT, PDO::PARAM_INT);
		$stmt->bindValue(':studentId', intval($studentId), PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$bookedData = $stmt->fetch();

		return boolval(intval($bookedData['isBooked']) === 1) && !check_user_in_waiting_list($lectureId, $studentId);
	}
}

if (!function_exists('update_attendance')) {
	function update_attendance($studentId, $lectureId, $attended) {
		$query = <<<'EOC'
UPDATE
	bookings 
SET
	attended = :attended 
WHERE
	user_id = :studentId AND
	lecture_id = :lectureId
EOC;

		$pdo = new PDO('sqlite:../db.sqlite');
		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':attended', intval($attended), PDO::PARAM_INT);
		$stmt->bindValue(':studentId', intval($studentId), PDO::PARAM_INT);
		$stmt->bindValue(':lectureId', intval($lectureId), PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$user_data = $stmt->fetch();

		if (!$user_data) {
			throw new ErrorException("User not found.");
		}

		return array(
			'success' => true,
			'userId' => intval($user_data['ID']),
			'type' => intval($user_data['type']),
			'username' => $user_data['username'],
			'email' => $user_data['email'],
			'firstname' => $user_data['firstname'],
			'lastname' => $user_data['lastname'],
			'city' => $user_data['city'],
			'birthday' => $user_data['birthday'],
			'SSN' => $user_data['SSN'],
		);
	}
}

if (!function_exists("get_user_by_ssn")) {
	function get_user_by_ssn($ssn) {
		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT ID, type, username, email, firstname, lastname, city, birthday, SSN FROM users WHERE SSN = :SSN");
		$stmt->bindValue(":SSN", $ssn, PDO::PARAM_STR);


		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$user_data = $stmt->fetch();

		if (!$user_data) {
			throw new ErrorException("User not found.");
		}

		return array(
			'success' => true,
			'userId' => intval($user_data['ID']),
			'type' => intval($user_data['type']),
			'username' => $user_data['username'],
			'email' => $user_data['email'],
			'firstname' => $user_data['firstname'],
			'lastname' => $user_data['lastname'],
			'city' => $user_data['city'],
			'birthday' => $user_data['birthday'],
			'SSN' => $user_data['SSN'],
		);
	}
}
