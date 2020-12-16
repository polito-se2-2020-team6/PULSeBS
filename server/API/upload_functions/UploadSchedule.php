<?php

define("SCHEDULE_CODE", 'Code');
define("SCHEDULE_ROOM", 'Room');
define("SCHEDULE_DAY", 'Day');
define("SCHEDULE_SEATS", 'Seats');
define("SCHEDULE_TIME", 'Time');

if (!function_exists("upload_schedules")) {

	function upload_schedules($vars) {

		try {
			$logged_user = get_myself();

			if (intval($logged_user['type']) != USER_TYPE_SPRT_OFCR) {
				throw new ErrorException("Wrong permissions");
			}

			if (!isset($_POST['startDay']) || !isset($_POST['endDay'])) {
				throw new Exception('Expected startDay and endDay parameters.');
			}

			// Undefined | Multiple Files | $_FILES Corruption Attack
			// If this request falls under any of them, treat it invalid.
			if (
				!isset($_FILES['schedule_file']['error']) ||
				is_array($_FILES['schedule_file']['error'])
			) {
				throw new RuntimeException('Invalid parameters.');
			}

			// Check $_FILES['schedule_file']['error'] value.
			switch ($_FILES['schedule_file']['error']) {
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

			$csv_file = array_map('str_getcsv', str_getcsv(file_get_contents($_FILES['schedule_file']['tmp_name']), "\n"));


			$positions = [
				SCHEDULE_CODE => array_search(SCHEDULE_CODE, $csv_file[0]),
				SCHEDULE_ROOM => array_search(SCHEDULE_ROOM, $csv_file[0]),
				SCHEDULE_DAY => array_search(SCHEDULE_DAY, $csv_file[0]),
				SCHEDULE_SEATS => array_search(SCHEDULE_SEATS, $csv_file[0]),
				SCHEDULE_TIME => array_search(SCHEDULE_TIME, $csv_file[0])
			];

			if (array_search(FALSE, $positions, TRUE) !== FALSE) {
				throw new Exception('Malformed input.');
			}

			$courses = get_list_of_course_codes();
			$rooms = get_list_of_rooms();

			$pdo = new PDO("sqlite:../db.sqlite");
			$pdo->beginTransaction();

			array_splice($csv_file, 0, 1);
			$stmt = $pdo->prepare('INSERT INTO lectures (course_id, room_id, start_ts, end_ts) VALUES (:courseId, :roomId, :startTs, :endTs);');
			foreach ($csv_file as $l) {
				if (
					array_key_exists($l[$positions[SCHEDULE_CODE]], $courses) === FALSE ||
					array_search($l[$positions[SCHEDULE_ROOM]], $rooms) === FALSE
				) {
					$pdo->rollBack();

					throw new Exception('Malformed input.');
				}

				$stmt->bindValue(':courseId', $l[$positions[SCHEDULE_CODE]], PDO::PARAM_INT);
				$stmt->bindValue(':roomId', $l[$positions[SCHEDULE_ROOM]], PDO::PARAM_INT);

				$start = new DateTime($_POST['startDay']);
				$end = new DateTime($_POST['endDay']);
				$correctFormat = preg_replace('/(\d{2}:\d{2})(:)(\d{2}:\d{2})/', '$1-$3', $l[$positions[SCHEDULE_TIME]]);
				if (!preg_match('/\d{2}:\d{2}-\d{2}:\d{2}/', $correctFormat)) {
					continue;
				}
				$times = explode('-', $correctFormat);

				$start->modify($l[$positions[SCHEDULE_DAY]]);
				$start->modify($times[0]);

				while ($start->getTimestamp() <= $end->getTimestamp()) {
					$startTs = $start->getTimestamp();
					$start->modify($times[1]);
					$endTs = $start->getTimestamp();

					$stmt->bindValue(':startTs', $startTs, PDO::PARAM_INT);
					$stmt->bindValue(':endTs', $endTs, PDO::PARAM_INT);

					if (!$stmt->execute()) {
						$pdo->rollBack();
						throw new PDOException('Input rejected by database.');
					}

					$start->modify($times[0]);
					$start->add(date_interval_create_from_date_string('7 days'));
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
