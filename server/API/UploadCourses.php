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

			if (array_search(false, $positions)) {
				throw new Exception('Malformed input.');
			}

			$teachers = get_list_of_teachers();

			$pdo = new PDO('sqlite:../db.sqlite');
			$pdo->beginTransaction();
			$stmt = $pdo->prepare('INSERT INTO courses (code, name, teacher_id, year, semester) VALUES (:code, :name, :teacherId, :year, :semester);');
			foreach ($lines as $l) {
				$fields = explode(',', $l, 5);
				$teacherId = substr($fields[$positions[TEACHER]], 1);
				if (!array_search($teacherId, $teachers)) {
					$pdo->rollBack();
					throw new Exception('Malformed input.');
				}
				$stmt->bindValue(':code', $fields[$positions[CODE]], PDO::PARAM_STR);
				$stmt->bindValue(':name', $fields[$positions[COURSE]], PDO::PARAM_STR);
				$stmt->bindValue(':teacherId', $teacherId, PDO::PARAM_INT);
				$stmt->bindValue(':year', $fields[$positions[YEAR]], PDO::PARAM_INT);
				$stmt->bindValue(':semester', $fields[$positions[SEMESTER]], PDO::PARAM_INT);

				if (!$stmt->execute()) {
					$pdo->rollBack();
					throw new PDOException('Input rejected by database.');
				}
			}

			$pdo->commit();
			echo json_encode([
				'success' => true
			]);
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage()
			]);
		}
	}
}
