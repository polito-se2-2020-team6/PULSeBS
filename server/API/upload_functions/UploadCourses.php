<?php

define("CODE", 'Code');
define("YEAR", 'Year');
define("SEMESTER", 'Semester');
define("COURSE", 'Course');
define("TEACHER", 'Teacher');

if (!function_exists("upload_courses")) {

	function upload_courses($vars) {

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
				YEAR => array_search(YEAR, $titles),
				SEMESTER => array_search(SEMESTER, $titles),
				COURSE => array_search(COURSE, $titles),
				TEACHER => array_search(TEACHER, $titles)
			];

			if (array_search(false, $positions) === FALSE) {
				throw new Exception('Malformed input.');
			}

			$teachers = get_list_of_teachers();

			$pdo->beginTransaction();
			$stmt = $pdo->prepare('INSERT INTO courses (code, name, teacher_id, year, semester) VALUES (:code, :name, :teacherId, :year, :semester);');
			foreach ($lines as $l) {
				$fields = str_getcsv($l, ',', '"');
				$teacherId = substr($fields[$positions[TEACHER]], 1);
				if (array_search($teacherId, $teachers) === FALSE) {
					$pdo->rollBack();
					throw new Exception('Malformed input.');
				}
				$stmt->bindValue(':code', $fields[$positions[CODE]], PDO::PARAM_STR);
				$stmt->bindValue(':name', $fields[$positions[COURSE]], PDO::PARAM_STR);
				$stmt->bindValue(':teacherId', intval($teacherId), PDO::PARAM_INT);
				$stmt->bindValue(':year', intval($fields[$positions[YEAR]]), PDO::PARAM_INT);
				$stmt->bindValue(':semester', intval($fields[$positions[SEMESTER]]), PDO::PARAM_INT);

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
				'reason' => $e->getMessage()
			]);
		}
	}
}
