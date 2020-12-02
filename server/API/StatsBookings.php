<?php

if (!function_exists('stats_bookings')) {

	function stats_bookings($vars) {

		// Get id of user
		$userId = intval($_SESSION['user_id']);

		try {
			$pdo = new PDO('sqlite:../db.sqlite');

			// Check user is a teacher
			$stmt = $pdo->prepare('SELECT *
								   FROM users
								   WHERE ID = :userId');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}
			$userData = $stmt->fetch();
			if (!$userData) {
				throw new PDOException('User ' . $userId . ' not found.');
			}

			if (intval($userData['type']) !== USER_TYPE_TEACHER && intval($userData['type']) !== USER_TYPE_BOOK_MNGR) {
				throw new Exception('Permission denied.');
			}

			// Get URL params
			$lecture = isset($_GET['lecture']) ? intval($_GET['lecture']) : null;
			$course = isset($_GET['course']) ? (intval($_GET['course']) ? intval($_GET['course']) : null) : null;
			$period = isset($_GET['period']) ? $_GET['period'] : null;
			$week = isset($_GET['week']) ? intval($_GET['week']) : null;
			$month = isset($_GET['month']) ? intval($_GET['month']) : null;
			$year = isset($_GET['year']) ? intval($_GET['year']) : null;

			// prepare query

			[$query, $dayStart, $dayEnd] = intval($userData['type']) === USER_TYPE_TEACHER ?
				construct_query_teacher($lecture, $course, $period, $week, $month, $year) :
				construct_query_bookingmngr($lecture, $course, $period, $week, $month, $year);

			// Retrieve data

			$stmt = $pdo->prepare($query);

			if (intval($userData['type']) === USER_TYPE_TEACHER) {
				$stmt->bindValue(':teacherId', $userId, PDO::PARAM_INT);
			}

			if ($lecture !== null) {
				$stmt->bindValue(':lectureId', $lecture, PDO::PARAM_INT);
			} else {
				if ($course !== null) {
					$stmt->bindValue(':courseId', $course, PDO::PARAM_INT);
				}
				if ($dayStart !== null) {
					$stmt->bindValue(':startDay', $dayStart, PDO::PARAM_INT);
				}
				if ($dayEnd !== null) {
					$stmt->bindValue(':endDay', $dayEnd, PDO::PARAM_INT);
				}
			}

			if (!$stmt->execute()) {
				throw new PDOException($stmt->errorInfo()[2]);
			}

			$stats = $stmt->fetch(PDO::FETCH_ASSOC);
			if (!$stats) {
				throw new PDOException('Statistical data not found.');
			}

			// Send
			$data = [
				'success' => true,
				'courseId' => intval($stats['courseId']),
				'bookingsAvg' => floatval($stats['bookingsAvg']),
				'bookingsStdDev' => sqrt(floatval($stats['bookingsVar'])),
				'totalBookings' => intval($stats['totalBookings']),
				'nLectures' => intval($stats['nLectures']),
			];

			if (intval($userData['type']) === USER_TYPE_BOOK_MNGR) {
				$data['cancellationsAvg'] = floatval($stats['cancellationsAvg']);
				$data['cancellationsStdDev'] = sqrt(floatval($stats['cancellationsVar']));
				$data['totalCancellations'] = intval($stats['totalCancellations']);
				$data['attendancesAvg'] = floatval($stats['attendancesAvg']);
				$data['attendancesStdDev'] = sqrt(floatval($stats['attendancesVar']));
				$data['totalAttendances'] = intval($stats['totalAttendances']);
			}

			echo json_encode($data);
		} catch (Exception $e) {
			echo json_encode(['success' => false, 'reason' => $e->getMessage()]);
		}
	}
}

if (!function_exists('construct_query_teacher')) {


	function construct_query_teacher($lecture, $course, $period, $week, $month, $year) {
		$queryTop = '
		SELECT
			courseId as courseId,
			AVG(totalBookings) as bookingsAvg,
			SUM((totalBookings - bookingsAvg) * (totalBookings - bookingsAvg)) / (COUNT(totalBookings) - 1) as bookingsVar,
			SUM(totalBookings) as totalBookings,
			
			SUM(nLectures) AS nLectures
		FROM (
			SELECT  
				courseId, 
				SUM(totalBookings) as totalBookings, 
				AVG(totalBookings) as bookingsAvg, 
		
				COUNT(*) as nLectures
			FROM (
				SELECT 
					lecture_id as lectureId,
					L.course_id as courseId,
					COUNT(IFNULL(cancellation_ts, 0)) as totalBookings
				FROM bookings B, lectures L, courses C
				WHERE B.lecture_id = L.ID
					AND L.course_id = C.ID
					AND teacher_id = :teacherId ';

		$queryBottom = ' GROUP BY lecture_id, course_id
					)
					GROUP BY courseId
				)';

		$queryMiddle = '';
		$dayStart = null;
		$dayEnd = null;

		if ($lecture !== null) {
			// Simple query, no actual need for statistics
			$queryMiddle = ' AND lecture_id = :lectureId ';
		} else {
			if ($course !== null) {
				$queryMiddle .= ' AND courseId = :courseId ';
			}

			if ($period === 'week') {
				if (is_numeric($week) && $week >= 0 && $week <= 52) {
					if ($year && $year > 0) {
						$dayStart = new DateTime();
						$dayStart = $dayStart->setISODate($year, $week + 1)->getTimestamp();

						$dayEnd = new DateTime();
						$dayEnd = $dayEnd->setISODate($year, $week + 1)->modify('+7 days -1 second')->getTimestamp();

						$queryMiddle .= ' AND start_ts >= :startDay ';
					} else {
						throw new Exception('Expected param year > 0');
					}
				} else {
					throw new Exception('Expected param 0 <= week <= 52');
				}
			} else if ($period === 'month') {
				if (is_numeric($month) && $month >= 0 && $month <= 11) {
					if ($year && $year > 0) {
						$dayStart = new DateTime();
						$dayStart = $dayStart->setDate($year, $month + 1, 1)->getTimestamp();

						$dayEnd = new DateTime();
						$dayEnd = $dayEnd->setDate($year, $month + 1, 1)->modify('+1 month -1 second')->getTimestamp();

						$queryMiddle .= ' AND start_ts >= :startDay ';
					} else {
						throw new Exception('Expected param year > 0');
					}
				} else {
					throw new Exception('Expected param 0 <= month <= 11');
				}
			}
			$queryMiddle .= ' AND start_ts <= :endDay ';
		}

		// Constrain period to be in the past
		$now = time();

		if ($dayStart !== null && $dayStart > $now) {
			$dayEnd = $dayStart - 1;
		}
		if (($dayEnd !== null && $dayEnd > $now) || $dayStart === null) {
			$dayEnd = $now;
		}

		return [$queryTop . $queryMiddle . $queryBottom, $dayStart, $dayEnd];
	}
}

if (!function_exists('construct_query_bookingmngr')) {


	function construct_query_bookingmngr($lecture, $course, $period, $week, $month, $year) {

		$queryTop = '
		SELECT
			courseId as courseId,
			AVG(totalBookings) as bookingsAvg,
			SUM((totalBookings - bookingsAvg) * (totalBookings - bookingsAvg)) / (COUNT(totalBookings) - 1) as bookingsVar,
			SUM(totalBookings) as totalBookings,
			
			AVG(totalCancellations) as cancellationsAvg,
			SUM((totalCancellations - cancellationsAvg) * (totalCancellations - cancellationsAvg)) / (COUNT(totalCancellations) - 1) as cancellationsVar,
			SUM(totalCancellations) as totalCancellations,
			
			AVG(totalAttendances) as attendancesAvg,
			SUM((totalAttendances - attendancesAvg) * (totalAttendances - attendancesAvg)) / (COUNT(totalAttendances) - 1) as attendancesVar,
			SUM(totalAttendances) as totalAttendances,
			
			SUM(nLectures) AS nLectures
		FROM (
			SELECT  
				courseId, 
				SUM(totalBookings) as totalBookings, 
				AVG(totalBookings) as bookingsAvg, 
				
				SUM(totalCancellations) as totalCancellations,
				AVG(totalCancellations) as cancellationsAvg,

				SUM(totalAttendances) as totalAttendances, 
				AVG(totalAttendances) as attendancesAvg,
				
				COUNT(*) as nLectures
			FROM (
				SELECT 
					lecture_id as lectureId,
					L.course_id as courseId,
					COUNT(cancellation_ts) as totalCancellations,
					COUNT(IFNULL(cancellation_ts, 0)) as totalBookings,
					SUM(attended) as totalAttendances
				FROM bookings B, lectures L, courses C
				WHERE B.lecture_id = L.ID
					AND L.course_id = C.ID ';

		$queryBottom = ' GROUP BY lecture_id, course_id
			)
			GROUP BY courseId
		)';

		$queryMiddle = '';
		$dayStart = null;
		$dayEnd = null;

		if ($lecture !== null) {
			// Simple query, no actual need for statistics
			$queryMiddle = ' AND lecture_id = :lectureId ';
		} else {
			if ($course !== null) {
				$queryMiddle .= ' AND courseId = :courseId ';
			}

			if ($period === 'week') {
				if (is_numeric($week) && $week >= 0 && $week <= 52) {
					if ($year && $year > 0) {
						$dayStart = new DateTime();
						$dayStart = $dayStart->setISODate($year, $week + 1)->getTimestamp();

						$dayEnd = new DateTime();
						$dayEnd = $dayEnd->setISODate($year, $week + 1)->modify('+7 days -1 second')->getTimestamp();

						$queryMiddle .= ' AND start_ts >= :startDay ';
					} else {
						throw new Exception('Expected param year > 0');
					}
				} else {
					throw new Exception('Expected param 0 <= week <= 52');
				}
			} else if ($period === 'month') {
				if (is_numeric($month) && $month >= 0 && $month <= 11) {
					if ($year && $year > 0) {
						$dayStart = new DateTime();
						$dayStart = $dayStart->setDate($year, $month + 1, 1)->getTimestamp();

						$dayEnd = new DateTime();
						$dayEnd = $dayEnd->setDate($year, $month + 1, 1)->modify('+1 month -1 second')->getTimestamp();

						$queryMiddle .= ' AND start_ts >= :startDay ';
					} else {
						throw new Exception('Expected param year > 0');
					}
				} else {
					throw new Exception('Expected param 0 <= month <= 11');
				}
			}
			$queryMiddle .= ' AND start_ts <= :endDay ';
		}

		// Constrain period to be in the past
		$now = time();

		if ($dayStart !== null && $dayStart > $now) {
			$dayEnd = $dayStart - 1;
		}
		if (($dayEnd !== null && $dayEnd > $now) || $dayStart === null) {
			$dayEnd = $now;
		}

		return [$queryTop . $queryMiddle . $queryBottom, $dayStart, $dayEnd];
	}
}
