<?php

define("ENROLLEMENT_CODE", 'Code');
define("STUDENT", 'Student');

if (!function_exists("upload_enrollments")) {

	function upload_enrollments($vars) {

		try {
			$logged_user = get_myself();

			if (intval($logged_user['type']) != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}


			// Undefined | Multiple Files | $_FILES Corruption Attack
			// If this request falls under any of them, treat it invalid.
			if (
				!isset($_FILES['enrollment_file']['error']) ||
				is_array($_FILES['enrollment_file']['error'])
			) {
				throw new RuntimeException('Invalid parameters.');
			}

			// Check $_FILES['enrollment_file']['error'] value.
			switch ($_FILES['enrollment_file']['error']) {
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

			$csv_file = array_map('str_getcsv', str_getcsv(file_get_contents($_FILES['enrollment_file']['tmp_name']), "\n"));

			$positions = [
				ENROLLEMENT_CODE => array_search(ENROLLEMENT_CODE, $csv_file[0]),
				STUDENT => array_search(STUDENT, $csv_file[0])
			];

			if (array_search(FALSE, $positions, TRUE) !== FALSE) {
				throw new Exception('Malformed input.');
			}

			$courses = get_list_of_course_codes();
			$students = get_list_of_students();

			$pdo = new PDO("sqlite:../db.sqlite");
			$pdo->beginTransaction();

			array_splice($csv_file, 0, 1);
			$stmt = $pdo->prepare('INSERT INTO course_subscriptions (user_id, course_id) VALUES (:studentId, :courseId);');
			foreach ($csv_file as $l) {
				if (
					array_key_exists($l[$positions[ENROLLEMENT_CODE]], $courses) === FALSE ||
					array_search($l[$positions[STUDENT]], $students) === FALSE
				) {
					$pdo->rollBack();

					throw new Exception('Malformed input.');
				}
				$stmt->bindValue(':studentId', intval($l[$positions[STUDENT]]), PDO::PARAM_INT);
				$stmt->bindValue(':courseId', intval($courses[$l[$positions[ENROLLEMENT_CODE]]]), PDO::PARAM_INT);

				if (!$stmt->execute()) {
					$pdo->rollBack();
					throw new PDOException('Input rejected by database.');
				}
			}

			$pdo->commit();
			echo json_encode(['success' => true], JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			]);
		}
	}
}
