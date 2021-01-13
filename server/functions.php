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

define('DB_PATH', "sqlite:../db.sqlite");
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

if(!function_exists("get_lectures_by_course")){
	function get_lectures_by_course($courseId, $startTs = null, $endTs = null){
		$pdo = new PDO("sqlite:../db.sqlite");

		// Get type of user
		$userData = get_myself();


		$userType = intval($userData['type']);

		if($userType != USER_TYPE_SPRT_OFCR){
			throw new ErrorException("Wrong permissions");
		}

		$query = 'SELECT L.*, C.name AS courseName, C.code AS courseCode, R.name AS roomName FROM lectures AS L, rooms AS R, (SELECT name,code FROM courses WHERE ID = :courseId) AS C WHERE L.room_id = R.ID AND L.course_id = :courseId';

		// Filter out cancelled lectures
		$query .= ' AND settings & :cancelled = 0';

		// Add optional ranges to query
		if (null !== $startTs) {
			$query .= ' AND start_ts >= :startDate';
		}
		if (null !== $endTs) {
			$query .= ' AND start_ts <= :endDate';
		}

		// Get list of lectures, ordered
		$query .= ' ORDER BY start_ts, ID ASC';
		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':courseId', $courseId, PDO::PARAM_INT);
		$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);

		if ($startTs !== null) {
			$stmt->bindValue(':startDate', $startTs, PDO::PARAM_INT);
		}
		if ($endTs !== null) {
			$stmt->bindValue(':endDate', $endTs, PDO::PARAM_INT);
		}

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$lectures = array();
		$l = $stmt->fetch();
		if(!$l){
			$ret = array(
				'courseId' => null,
				'courseCode' => null,
				'courseName' => null
			);
		}
		else{
			$ret = array(
				'courseId' => intval($l['course_id']),
				'courseCode' => $l['courseCode'],
				'courseName' => $l['courseName'],
			);
			do{
				$lecture = array(
					'lectureId' => intval($l['0']),
					'startTS' => intval($l['start_ts']),
					'endTS' => intval($l['end_ts']),
					'online' => boolval($l['settings'] & LECTURE_REMOTE),
					'roomName' => $l['roomName']
				);

				array_push($lectures, $lecture);
			} while ($l = $stmt->fetch());
		}

		// Send stuff
		return array('lectures' => $lectures) + $ret;
	}
}


function get_students_booked_by_lecture($lectureId){
	$pdo = new PDO(DB_PATH);
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
	return $students
}