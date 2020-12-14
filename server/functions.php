<?php 
session_start();
$server_default_timezone = date_default_timezone_get();  //needed to know which timezone the server uses
date_default_timezone_set("UTC");
/* Utilities */

if (!function_exists("check_login")) {
	/**
	 * Check if a user is logged
	 * 
	 * @return bool true if is logged, false otherwise
	 */
	function check_login() {
		$pdo = new PDO("sqlite:../db.sqlite");

		if(!isset($_SESSION["user_id"]) || !isset($_SESSION["nonce"])){
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

if(!function_exists("get_seats_by_lecture")){
	function get_seats_by_lecture($lecture_id){
		$pdo = new PDO("sqlite:../db.sqlite");

		//get the seats number
		$stmt = $pdo->prepare("SELECT seats FROM lectures, rooms WHERE lectures.room_id = rooms.ID AND lectures.ID = :lectureId");
		$stmt->bindValue(":lectureId", $lecture_id, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$seats = $stmt->fetchColumn();

		if($seats === false){
			throw new ErrorException("Cannot retrieve number of seats");
		}

		return intval($seats);
	}
}

if (!function_exists("check_user_in_waiting_list")){
	function check_user_in_waiting_list($lecture_id, $user_id = null){
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

if(!function_exists("get_waiting_list_by_lecture")){
	function get_waiting_list_by_lecture($lecture_id){
		$seats = get_seats_by_lecture($lecture_id);

		$pdo = new PDO("sqlite:../db.sqlite");

		$stmt = $pdo->prepare("SELECT user_id FROM bookings WHERE lecture_id = :lectureId AND cancellation_ts IS NULL ORDER BY booking_ts ASC LIMIT -1 OFFSET :seats");
		
		$stmt->bindValue(":lectureId", $lecture_id, PDO::PARAM_INT);
		$stmt->bindValue(":seats", $seats, PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo()[2]);
		}

		$waitlist = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

		if($waitlist === false) $waitlist = array();
		else if(!is_array($waitlist)) $waitlist = array($waitlist);
		return $waitlist;
	}
}

if(!function_exists("get_myself")){
	function get_myself() {
		if(!isset($_SESSION["user_id"]) || !isset($_SESSION["nonce"])){
			return false;
		}

		try {
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
			);
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}
?>
