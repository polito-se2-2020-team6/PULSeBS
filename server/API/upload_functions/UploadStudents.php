<?php

define("ID", "Id");
define("NAME", "Name");
define("SURNAME", "Surname");
define("CITY", "City");
define("EMAIL", "OfficialEmail");
define("BIRTHDAY", "Birthday");
define("SSN", "SSN");

if (!function_exists("upload_students")) {
	function upload_students($vars) {
		try {
			$logged_user = get_myself();

			if (intval($logged_user['type']) != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}


			// Undefined | Multiple Files | $_FILES Corruption Attack
			// If this request falls under any of them, treat it invalid.
			if (
				!isset($_FILES['student_file']['error']) ||
				is_array($_FILES['student_file']['error'])
			) {
				throw new RuntimeException('Invalid parameters.');
			}

			// Check $_FILES['student_file']['error'] value.
			switch ($_FILES['student_file']['error']) {
				case UPLOAD_ERR_OK:
					break;
				case UPLOAD_ERR_NO_FILE:
					throw new RuntimeException('No file sent.');
				case UPLOAD_ERR_INI_SIZE:
				case UPLOAD_ERR_FORM_SIZE:
					throw new RuntimeException('Exceeded filesize limit.');
				default:
					throw new RuntimeException('Unknown errors.');
			}

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

			if (array_search(false, $positions) === FALSE) {
				throw new ErrorException('Malformed input.');
			}

			$pdo = new PDO("sqlite:../db.sqlite");

			$pdo->beginTransaction();

			array_splice($csv_file, 0, 1);

			foreach ($csv_file as $student) {
				$stmt = $pdo->prepare("INSERT INTO users (ID, username, password, type, email, firstname, lastname, city, birthday, SSN) VALUES (:studentId, :username, :passw, :usertype, :email, :firstname, :lastname, :city, :birthday, :SSN)");

				$stmt->bindValue(":studentId", $student[$positions[ID]], PDO::PARAM_INT);
				$stmt->bindValue(":username", "s" . $student[$positions[ID]]);
				$stmt->bindValue(":passw", password_hash(bin2hex(random_bytes(8)), PASSWORD_BCRYPT));
				$stmt->bindValue(":usertype", USER_TYPE_STUDENT, PDO::PARAM_INT);
				$stmt->bindValue(":email", $student[$positions[EMAIL]]);
				$stmt->bindValue(":firstname", $student[$positions[NAME]]);
				$stmt->bindValue(":lastname", $student[$positions[SURNAME]]);
				$stmt->bindValue(":city", $student[$positions[CITY]]);
				$stmt->bindValue(":birthday", $student[$positions[BIRTHDAY]]);
				$stmt->bindValue(":SSN", $student[$positions[SSN]]);

				if (!$stmt->execute()) {
					$pdo->rollBack();
					throw new PDOException('Input rejected by database.');
				}
			}
			$pdo->commit();

			echo json_encode(array('success' => true));
		} catch (Exception $e) {
			echo json_encode(array(
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			));
		}
	}
}
