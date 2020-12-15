<?php

$studentQuery = <<<'EOC'
SELECT
	lectureId,
	courseId,
	courseName,
	year,
	semester,
	startTS,
	endTS,
	online,
	teacherName,
	roomName,
	IFNULL(MIN(COUNT(*), totalSeats), 0) as bookedSeats,
	totalSeats,
	IFNULL(SUM(isMe), 0) as bookedSelf,
	IFNULL(NOT (bookingOrder <= totalSeats AND SUM(isMe) = 1), 0) as inWaitingList
FROM (
	SELECT
		L.ID as lectureId,
		C.ID as courseId,
		C.name as courseName,
		1 as year,
		1 as semester,
		L.start_ts as startTS,
		L.end_ts as endTS,
		L.settings & :online as online,
		U.lastname || ' ' || U.firstname as teacherName,
		R.name as roomName,
		B.user_id as bookedUser,
		R.seats as totalSeats,
		B.user_id = :studentId as isMe,
		RANK() OVER (PARTITION BY L.ID ORDER BY B.booking_ts ASC) AS bookingOrder 
	FROM
		lectures L, rooms R, courses C, users U
		LEFT JOIN bookings B
		ON B.lecture_id = L.ID
	WHERE
		L.room_id = R.ID AND
		L.course_id = C.ID AND
		C.teacher_id = U.ID AND
		B.cancellation_ts IS NULL AND
		L.settings & :cancelled = 0 AND
		L.start_ts >= :startTS AND
		L.start_ts <= :endTS
	GROUP BY L.ID, B.booking_ts
	ORDER BY lectureID, bookingOrder
)
GROUP BY
	lectureId
EOC;

$teacherQuery = <<<'EOC'
SELECT
	lectureId,
	courseId,
	courseName,
	year,
	semester,
	startTS,
	endTS,
	online,
	teacherName,
	roomName,
	IFNULL(MIN(COUNT(*), totalSeats), 0) as bookedSeats,
	IFNULL(MAX(0, COUNT(*) - totalSeats), 0) as waitingUsers,
	totalSeats
FROM (
	SELECT
		L.ID as lectureId,
		C.ID as courseId,
		C.name as courseName,
		1 as year,
		1 as semester,
		L.start_ts as startTS,
		L.end_ts as endTS,
		L.settings & :online as online,
		U.lastname || ' ' || U.firstname as teacherName,
		R.name as roomName,
		B.user_id as bookedUser,
		R.seats as totalSeats
	FROM
		lectures L, rooms R, courses C, users U
		LEFT JOIN bookings B
		ON B.lecture_id = L.ID
	WHERE
		L.room_id = R.ID AND
		L.course_id = C.ID AND
		C.teacher_id = U.ID AND
		B.cancellation_ts IS NULL AND 
		U.ID = :teacherId AND 
		L.settings & :cancelled = 0 AND
		L.start_ts >= :startTS AND
		L.start_ts <= :endTS
)
GROUP BY
	lectureId
EOC;

$bookMngrQuery = <<<'EOC'
SELECT
	lectureId,
	courseId,
	courseName,
	year,
	semester,
	startTS,
	endTS,
	online,
	teacherName,
	roomName,
	IFNULL(MIN(SUM(isBooked), totalSeats), 0) as bookedSeats,
	IFNULL(MAX(0, SUM(isBooked) - totalSeats), 0) as waitingUsers,
	IFNULL(SUM(isCancelled), 0) as cancelledBookings,
	totalSeats
FROM (
	SELECT
		L.ID as lectureId,
		C.ID as courseId,
		C.name as courseName,
		1 as year,
		1 as semester,
		L.start_ts as startTS,
		L.end_ts as endTS,
		L.settings & :online as online,
		U.lastname || ' ' || U.firstname as teacherName,
		R.name as roomName,
		B.cancellation_ts IS NULL as isBooked,
		B.cancellation_ts IS NOT NULL as isCancelled,
		R.seats as totalSeats
	FROM
		lectures L, rooms R, courses C, users U
		LEFT JOIN bookings B
		ON B.lecture_id = L.ID
	WHERE
		L.room_id = R.ID AND
		L.course_id = C.ID AND
		C.teacher_id = U.ID AND
		L.settings & :cancelled = 0 AND
		L.start_ts >= :startTS AND
		L.start_ts <= :endTS
)
GROUP BY
	lectureId
EOC;

if (!function_exists('list_lectures')) {

	function list_lectures($vars) {

		global $studentQuery;
		global $teacherQuery;
		global $bookMngrQuery;


		try {

			$userId = intval($vars['userId']);
			if ($userId != $_SESSION['user_id']) {
				throw new Exception("Trying to see another person's data.");
			}

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
				echo json_encode(array('success' => false));
				return;
			}

			$userType = intval($userData['type']);

			switch ($userType) {
				case USER_TYPE_STUDENT:
					$stmt = $pdo->prepare($studentQuery);
					$stmt->bindValue(':online', LECTURE_REMOTE, PDO::PARAM_INT);
					$stmt->bindValue(':studentId', $userId, PDO::PARAM_INT);
					$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
					$stmt = bindTimeConstraints(
						$stmt,
						isset($_GET['startDate']) ? $_GET['startDate'] : null,
						isset($_GET['endDate']) ? $_GET['endDate'] : null
					);
					break;
				case USER_TYPE_TEACHER:
					$stmt = $pdo->prepare($teacherQuery);
					$stmt->bindValue(':online', LECTURE_REMOTE, PDO::PARAM_INT);
					$stmt->bindValue(':teacherId', $userId, PDO::PARAM_INT);
					$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
					$stmt = bindTimeConstraints(
						$stmt,
						isset($_GET['startDate']) ? $_GET['startDate'] : null,
						isset($_GET['endDate']) ? $_GET['endDate'] : null
					);
					break;
				case USER_TYPE_BOOK_MNGR:
					$stmt = $pdo->prepare($bookMngrQuery);
					$stmt->bindValue(':online', LECTURE_REMOTE, PDO::PARAM_INT);
					$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
					$stmt = bindTimeConstraints(
						$stmt,
						isset($_GET['startDate']) ? $_GET['startDate'] : null,
						isset($_GET['endDate']) ? $_GET['endDate'] : null
					);
					break;
				default:
					throw new Exception("Unknown user type " . $userType);
					break;
			}

			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			$lectures = $stmt->fetchAll(PDO::FETCH_ASSOC);

			echo json_encode([
				'success' => true,
				'lectures' => array_map(
					function ($e) {
						return array(
							'lectureId' => intval($e["lectureId"]),
							'courseId' => intval($e["courseId"]),
							'courseName' => $e["courseName"],
							/*'year' => intval($e['year']),
							 TODO: reactivate in master
							'semester' => intval($e['semester']),
							*/
							'startTS' => intval($e["startTS"]),
							
							'endTS' => intval($e["endTS"]),
							'online' => boolval($e["online"]),
							'teacherName' => $e["teacherName"],
							'roomName' => $e["roomName"],
							'bookedSeats' => intval($e["bookedSeats"]),
							'totalSeats' => intval($e["totalSeats"]),
							'bookedSelf' => isset($e["bookedSelf"]) ? boolval($e["bookedSelf"]) : null,
							'inWaitingList' => isset($e["inWaitingList"]) ? boolval($e["inWaitingList"]) : null,
							'waitingUsers' => isset($e["waitingUsers"]) ? intval($e["waitingUsers"]) : null,
							'cancelledBookings' => isset($e["cancelledBookings"]) ? boolval($e["cancelledBookings"]) : null,
						);
					},
					$lectures
				)
			]);
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage()
			]);
		}
	}
}


if (!function_exists('bindTimeConstraints')) {


	function bindTimeConstraints($pdoStmt, $startISODate, $endISODate) {
		$startTS = 0;
		$endTS = 9e9;

		if ($startISODate) {
			$Ymd = explode('-', $startISODate);
			$startTS = mktime(0, 0, 0, intval($Ymd[1]), intval($Ymd[2]), intval($Ymd[0]));
		}
		if ($endISODate) {
			$Ymd = explode('-', $endISODate);
			$endTS = mktime(0, 0, 0, intval($Ymd[1]), intval($Ymd[2]), intval($Ymd[0]));
		}

		$pdoStmt->bindValue(':startTS', $startTS, PDO::PARAM_INT);
		$pdoStmt->bindValue(':endTS', $endTS, PDO::PARAM_INT);

		return $pdoStmt;
	}
}
