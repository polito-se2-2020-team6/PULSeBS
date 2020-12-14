<?php

include_once '../functions.php';

define("CODE", 'Code');
define("STUDENT", 'Student');

if (!function_exists("upload_enrollments")) {

	function upload_enrollments($vars) {

		try {
			$userId = intval($_SESSION['user_id']);
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
				throw new PDOException('Error during authorization.');
			}

			$userType = intval($userData['type']);
			if ($userType != USER_TYPE_SPRT_OFCR) {
				throw new Exception("No authorization.");
			}

			if (!isset($_POST['text'])) {
				throw new Exception('Excpected text field.');
			}

			$lines = explode('\n', $_POST['text']);
			$titles = explode(',', $lines[0], 5);
			array_splice($lines, 0, 1);

			$positions = [
				CODE => array_search(CODE, $titles),
				STUDENT => array_search(STUDENT, $titles)
			];

			if (array_search(false, $positions) === FALSE) {
				throw new Exception('Malformed input.');
			}

			$courses = get_list_of_course_codes();
			$students = get_list_of_students();

			$pdo->beginTransaction();
			$stmt = $pdo->prepare('INSERT INTO course_subscriptions (user_id, course_id) VALUES (:studentId, :courseId);');
			foreach ($lines as $l) {
				$fields = str_getcsv($l, ',', '"');
				if (
					array_key_exists($fields[$positions[CODE]], $courses) === FALSE ||
					array_search($fields[$positions[STUDENT]], $students) === FALSE
				) {
					$pdo->rollBack();

					throw new Exception('Malformed input.');
				}
				$stmt->bindValue(':studentId', intval($fields[$positions[STUDENT]]), PDO::PARAM_INT);
				$stmt->bindValue(':courseId', intval($courses[$fields[$positions[CODE]]]), PDO::PARAM_INT);

				if (!$stmt->execute()) {
					$pdo->rollBack();
					throw new PDOException('Input rejected by database.');
				}
			}

			$pdo->commit();
			echo json_encode(['success' => true]);
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			]);
		}
	}
}
