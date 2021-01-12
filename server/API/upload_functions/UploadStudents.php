<?php

define("ID", "Id");
define("NAME", "Name");
define("SURNAME", "Surname");
define("CITY", "City");
define("EMAIL", "OfficialEmail");
define("BIRTHDAY", "Birthday");
define("SSN", "SSN");

define('DEFAULT_STUDENT_PASSWORD', "abc123");

if (!function_exists("upload_students")) {
	function upload_students() {
		try {
			$logged_user = get_myself();

			if (intval($logged_user['type']) != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}

			check_file_uploaded('student_file');

			$csv_file = array_map('str_getcsv', str_getcsv(file_get_contents($_FILES['student_file']['tmp_name']), "\n"));

			$positions = array(
				ID => array_search(ID, $csv_file[0]),
				NAME => array_search(NAME, $csv_file[0]),
				SURNAME => array_search(SURNAME, $csv_file[0]),
				CITY => array_search(CITY, $csv_file[0]),
				EMAIL => array_search(EMAIL, $csv_file[0]),
				BIRTHDAY => array_search(BIRTHDAY, $csv_file[0]),
				SSN => array_search(SSN, $csv_file[0])
			);

			if (array_search(FALSE, $positions, TRUE) !== FALSE) {
				throw new ErrorException('Malformed input.');
			}

			$pdo = new PDO("sqlite:../db.sqlite");

			$pdo->beginTransaction();

			array_splice($csv_file, 0, 1);

			$password_tmp = password_hash(DEFAULT_STUDENT_PASSWORD, PASSWORD_BCRYPT); //THIS SHOULD NOT BE DONE. IS DONE ONLY FOR TESTING PURPOSE

			foreach ($csv_file as $student) {
				$stmt = $pdo->prepare("INSERT INTO users (ID, username, password, type, email, firstname, lastname, city, birthday, SSN) VALUES (:studentId, :username, :passw, :usertype, :email, :firstname, :lastname, :city, :birthday, :SSN)");

				$stmt->bindValue(":studentId", $student[$positions[ID]], PDO::PARAM_INT);
				$stmt->bindValue(":username", "s" . $student[$positions[ID]]);
				$stmt->bindValue(":passw", $password_tmp);
				$stmt->bindValue(":usertype", USER_TYPE_STUDENT, PDO::PARAM_INT);
				$stmt->bindValue(":email", $student[$positions[EMAIL]]);
				$stmt->bindValue(":firstname", $student[$positions[NAME]]);
				$stmt->bindValue(":lastname", $student[$positions[SURNAME]]);
				$stmt->bindValue(":city", $student[$positions[CITY]]);
				$stmt->bindValue(":birthday", $student[$positions[BIRTHDAY]]);
				$stmt->bindValue(":SSN", $student[$positions[SSN]]);

				if (!$stmt->execute()) {
					$pdo->rollBack();
					throw new PDOException($stmt->errorInfo()[2]);
				}
			}
			$pdo->commit();

			echo json_encode(array('success' => true), JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode(array(
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			));
		}
	}
}
