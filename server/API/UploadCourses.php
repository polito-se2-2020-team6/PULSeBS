<?php

include_once '../functions.php';

define("CODE", 'Code');
define("YEAR", 'Year');
define("SEMESTER", 'Semester');
define("COURSE", 'Course');
define("TEACHER", 'Teacher');

if (!function_exists("upload_courses")) {

	function upload_courses($vars) {

		try {
			$userId = $_SESSION['user_id'];
			if ($userId != USER_TYPE_SPRT_OFCR) {
				throw new Exception("No authorization.");
			}

			if (!isset($_POST['text'])) {
				throw new Exception('Excpected text field.');
			}

			$lines = str_getcsv($_POST['text'], ',', '"');

			$teachers = get_list_of_teachers();

			$pdo = new PDO('sqlite:../db.sqlite');
			$pdo->beginTransaction();
			$stmt = $pdo->prepare('INSERT INTO courses (code, name, teacher_id, year, semester) VALUES (:code, :name, :teacherId, :year, :semester);');
			foreach ($lines as $l) {
				$teacherId = substr($l[TEACHER], 1);
				if (!array_search($teacherId, $teachers)) {
					$pdo->rollBack();
					throw new Exception('Malformed input.');
				}
				$stmt->bindValue(':code', $l[CODE], PDO::PARAM_STR);
				$stmt->bindValue(':name', $l[COURSE], PDO::PARAM_STR);
				$stmt->bindValue(':teacherId', intval($teacherId), PDO::PARAM_INT);
				$stmt->bindValue(':year', intval($l[YEAR]), PDO::PARAM_INT);
				$stmt->bindValue(':semester', intval($l[SEMESTER]), PDO::PARAM_INT);

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
