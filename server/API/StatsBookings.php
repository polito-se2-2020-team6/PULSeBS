<?php

if (!function_exists('stats_bookings')) {

	function stats_bookings($vars) {

		// Get id of user
		$userId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : 2;

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

			if (intval($userData['type']) !== USER_TYPE_TEACHER) {
				throw new Exception('Permission denied,');
			}

			// Get URL params
			$lecture = isset($_GET['lecture']) ? intval($_GET['lecture']) : null;
			$course = isset($_GET['course']) ? (intval($_GET['course']) ? intval($_GET['course']) : null) : null;
			$period = isset($_GET['period']) ? $_GET['period'] : null;
			$week = isset($_GET['week']) ? intval($_GET['week']) : null;
			$month = isset($_GET['month']) ? intval($_GET['month']) : null;
			$year = isset($_GET['year']) ? intval($_GET['year']) : null;

			// Retrieve data

			$queryTop = '
			SELECT
				courseId as courseId,
				AVG(totalBookings) as bookingsAvg,
				AVG(totalBookings * totalBookings) - totalBookings * totalBookings  as bookingsStdDev,
				SUM(totalBookings) as totalBookings,
				COUNT(*) AS nLectures
			FROM (SELECT 
					L.course_id as courseId,
					COUNT(*) as totalBookings
					FROM bookings B, lectures L, courses C
					WHERE B.lecture_id = L.ID
					AND L.course_id = C.ID
					AND cancellation_ts IS NULL
					AND teacher_id = :teacherId ';

			$queryBottom = ' GROUP BY lecture_id, course_id)
			GROUP BY courseId';

			$queryMiddle = '';

			if ($lecture !== null) {
				// Simple query, no actual need for statistics
				$queryMiddle = ' AND lecture_id = :lectureId ';
				$stmt->bindValue(':lectureId', $lecture, PDO::PARAM_INT);
			} else {
				if ($course !== null) {
					$queryMiddle .= ' AND courseId = :courseId ';
				}

				if ($period === 'week') {
					if ($week && $week >= 0 && $week <= 52) {
						if ($year && $year > 0) {
							$dayStart = new DateTime();
							$dayStart = $dayStart->setISODate($year, $week + 1)->getTimestamp();

							$dayEnd = new DateTime();
							$dayEnd = $dayEnd->setISODate($year, $week + 1)->modify('+7 days -1 second')->getTimestamp();

							$queryMiddle .= ' AND start_ts >= :startDay AND start_ts <= :endDay ';
						} else {
							throw new Exception('Expected param year > 0');
						}
					} else {
						throw new Exception('Expected param 0 <= week <= 52');
					}
				} else if ($period === 'month') {
					if ($month && $month >= 0 && $month <= 11) {
						if ($year && $year > 0) {
							$dayStart = new DateTime();
							$dayStart = $dayStart->setDate($year, $month + 1, 1)->getTimestamp();

							$dayEnd = new DateTime();
							$dayEnd = $dayEnd->setDate($year, $month + 1, 1)->modify('+1 month -1 second')->getTimestamp();

							$queryMiddle .= ' AND start_ts >= :startDay AND start_ts <= :endDay ';
						} else {
							throw new Exception('Expected param year > 0');
						}
					} else {
						throw new Exception('Expected param 0 <= month <= 11');
					}
				} else if ($period === null || $period === 'all') {
					$queryMiddle .= ' AND end_ts <= :endDay';
				}
			}

			// Constrain period to be in the past
			$now = time();

			if ($dayStart !== null && $dayStart > $now) {
				$dayEnd = $dayStart - 1;
			}
			if (($dayEnd !== null && $dayEnd > $now) || $dayStart === null) {
				$dayEnd = $now;
			}

			$stmt = $pdo->prepare($queryTop . $queryMiddle . $queryBottom);
			$stmt->bindValue(':teacherId', $userId, PDO::PARAM_INT);
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
			echo json_encode([
				'success' => true,
				'courseId' => intval($stats['courseId']),
				'bookingsAvg' => floatval($stats['bookingsAvg']),
				'bookingsStdDev' => floatval($stats['bookingsStdDev']),
				'totalBookings' => intval($stats['totalBookings']),
				'nLectures' => intval($stats['nLectures'])
			]);
		} catch (Exception $e) {
			echo json_encode(['success' => false, 'reason' => $e->getMessage()]);
		}
	}
}
