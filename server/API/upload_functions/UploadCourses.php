<?php

define("CODE", 'Code');
define("YEAR", 'Year');
define("SEMESTER", 'Semester');
define("COURSE", 'Course');
define("TEACHER", 'Teacher');

if (!function_exists("upload_courses")) {

	function upload_courses() {

		try {
			$logged_user = get_myself();

			if (intval($logged_user['type']) != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}

			check_file_uploaded('course_file');

			$csv_file = array_map('str_getcsv', str_getcsv(file_get_contents($_FILES['course_file']['tmp_name']), "\n"));


			$positions = [
				CODE => array_search(CODE, $csv_file[0]),
				YEAR => array_search(YEAR, $csv_file[0]),
				SEMESTER => array_search(SEMESTER, $csv_file[0]),
				COURSE => array_search(COURSE, $csv_file[0]),
				TEACHER => array_search(TEACHER, $csv_file[0])
			];

			if (array_search(FALSE, $positions, TRUE) !== FALSE) {
				throw new Exception('Malformed input.');
			}

			$teachers = get_list_of_teachers();

			$pdo = new PDO("sqlite:../db.sqlite");
			$pdo->beginTransaction();

			array_splice($csv_file, 0, 1);
			$stmt = $pdo->prepare('INSERT INTO courses (code, name, teacher_id, year, semester) VALUES (:code, :name, :teacherId, :year, :semester);');
			foreach ($csv_file as $l) {
				$teacherId = substr($l[$positions[TEACHER]], 1);
				if (array_search($teacherId, $teachers) === FALSE) {
					$pdo->rollBack();
					throw new Exception('Malformed input.');
				}
				$stmt->bindValue(':code', $l[$positions[CODE]], PDO::PARAM_STR);
				$stmt->bindValue(':name', $l[$positions[COURSE]], PDO::PARAM_STR);
				$stmt->bindValue(':teacherId', intval($teacherId), PDO::PARAM_INT);
				$stmt->bindValue(':year', intval($l[$positions[YEAR]]), PDO::PARAM_INT);
				$stmt->bindValue(':semester', intval($l[$positions[SEMESTER]]), PDO::PARAM_INT);

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
				'reason' => $e->getMessage()
			]);
		}
	}
}
