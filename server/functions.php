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
			throw new PDOException($stmt->errorInfo()[2], $stmt->errorInfo()[0]);
		}

		$user_data = $stmt->fetch();


		return $_SESSION["nonce"] == md5(serialize($user_data)) && intval($_SESSION['user_id']) == intval($user_data['ID']);

	}
}

?>
