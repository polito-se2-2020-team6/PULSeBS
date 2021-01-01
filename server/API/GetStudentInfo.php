<?php

if (!function_exists('get_student_info')) {

	function get_student_info($vars) {
		$code = $vars['code'];
		$field = $vars['field'];

		try {
			$loggedUser = get_myself();
			if ($loggedUser['type'] !== USER_TYPE_BOOK_MNGR) {
				throw new ErrorException('Wrong permissions.');
			}

			if (strlen($code) === 0) {
				throw new ErrorException('Code expected.');
			}

			switch ($field) {
				case 'id':
					if (!is_numeric($code)) {
						throw new ErrorException('Code expected to be integer.');
					}
					$user = get_user($code);
					break;
				case 'ssn':
					if (is_numeric($code)) {
						throw new ErrorException('Code expected to be string.');
					}
					$user = get_user_by_ssn($code);
					break;
				default:
					throw new RuntimeException('Dead code.');
					break;
			}

			if ($user['type'] !== USER_TYPE_STUDENT) {
				throw new ErrorException('User is not a student.');
			}

			echo json_encode($user, JSON_INVALID_UTF8_SUBSTITUTE);
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			], JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}
