<?php

define("TEACHER_ID", "Number");
define("TEACHER_NAME", "GivenName");
define("TEACHER_SURNAME", "Surname");
define("TEACHER_EMAIL", "OfficialEmail");
define("TEACHER_SSN", "SSN");

define('DEFAULT_TEACHER_PASSWORD', "123abc");

if (!function_exists("upload_teachers")) {
	function upload_teachers($vars) {
		try {
			$logged_user = get_myself();

			if (intval($logged_user['type']) != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}


			// Undefined | Multiple Files | $_FILES Corruption Attack
			// If this request falls under any of them, treat it invalid.
			if (
				!isset($_FILES['teacher_file']['error']) ||
				is_array($_FILES['teacher_file']['error'])
			) {
				throw new RuntimeException('Invalid parameters.');
			}

			// Check $_FILES['teacher_file']['error'] value.
			switch ($_FILES['teacher_file']['error']) {
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

			$csv_file = array_map('str_getcsv', str_getcsv(file_get_contents($_FILES['teacher_file']['tmp_name']), "\n"));

			$positions = array(
				TEACHER_ID => array_search(TEACHER_ID, $csv_file[0]),
				TEACHER_NAME => array_search(TEACHER_NAME, $csv_file[0]),
				TEACHER_SURNAME => array_search(TEACHER_SURNAME, $csv_file[0]),
				TEACHER_EMAIL => array_search(TEACHER_EMAIL, $csv_file[0]),
				TEACHER_SSN => array_search(TEACHER_SSN, $csv_file[0])
			);

			if (array_search(FALSE, $positions, TRUE) !== FALSE) {
				throw new ErrorException('Malformed input.');
			}

			$pdo = new PDO("sqlite:../db.sqlite");

			$pdo->beginTransaction();

			array_splice($csv_file, 0, 1);

			$password_tmp = password_hash(DEFAULT_TEACHER_PASSWORD, PASSWORD_BCRYPT); //THIS SHOULD NOT BE DONE. IS DONE ONLY FOR TESTING PURPOSE

			foreach ($csv_file as $student) {
				$stmt = $pdo->prepare("INSERT INTO users (ID, username, password, type, email, firstname, lastname, SSN) VALUES (:teacherId, :username, :passw, :usertype, :email, :firstname, :lastname, :SSN)");

				$stmt->bindValue(":teacherId", intval(substr($student[$positions[TEACHER_ID]], 1)), PDO::PARAM_INT);
				$stmt->bindValue(":username", $student[$positions[TEACHER_ID]]);
				$stmt->bindValue(":passw", $password_tmp);
				$stmt->bindValue(":usertype", USER_TYPE_TEACHER, PDO::PARAM_INT);
				$stmt->bindValue(":email", $student[$positions[TEACHER_EMAIL]]);
				$stmt->bindValue(":firstname", $student[$positions[TEACHER_NAME]]);
				$stmt->bindValue(":lastname", $student[$positions[TEACHER_SURNAME]]);
				$stmt->bindValue(":SSN", $student[$positions[TEACHER_SSN]]);

				if (!$stmt->execute()) {
					$pdo->rollBack();
					throw new PDOException($stmt->errorInfo()[2]);
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
