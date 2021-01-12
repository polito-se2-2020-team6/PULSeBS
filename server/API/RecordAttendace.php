<?php

if (!function_exists('record_attendance')) {
	function record_attendance($vars) {

		global $_PATCH;

		$lectureId = $vars['lectureId'];
		$studentId = $vars['studentId'];

		try {

			// imgur.com/a/csobBal
			$now = new DateTime();

			// Check body passed correctly
			if (!isset($_PATCH['attended'])) {
				throw new ErrorException("Expected param 'attended'.");
			}

			// Check login as teacher
			$teacherData = get_myself();
			if ($teacherData['type'] !== USER_TYPE_TEACHER) {
				throw new ErrorException("Not authorized.");
			}

			// Check lecture is taught by teacher
			$courseData = get_course_from_lecture($lectureId);
			if ($courseData['teacherId'] !== $teacherData['userId']) {
				throw new ErrorException("Not authorized.");
			}

			// Check student is booked to lecture
			if (!is_student_booked_no_waitlist($studentId, $lectureId)) {
				throw new ErrorException("Student not booked.");
			}

			// Check time constrains
			$lectureData = get_lecture($lectureId);
			$maxTs = $now->getTimestamp();
			$minTs = $now->modify('midnight')->getTimestamp();
			if ($lectureData['startTs'] < $minTs || $lectureData['startTs'] > $maxTs) {
				throw new ErrorException("Time constrain violated.");
			}

			// Update attendance
			update_attendance($studentId, $lectureId, $_PATCH['attended']);

			// Generate response
			echo json_encode(['success' => true], JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			], JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}
