<?php

if (!function_exists('get_contact_report')) {
	function get_contact_report($vars) {

		$contentTypes = [
			'pdf' => 'application/pdf',
			'csv' => 'text/csv'
		];

		$infectedStudentId = $vars['userId'];
		$requestedFormat = $vars['format'];

		try {
			$loggedUser = get_myself();
			if ($loggedUser['type'] !== USER_TYPE_BOOK_MNGR) {
				throw new ErrorException('Wrong permissions.');
			}

			$infectedStudent = get_user($infectedStudentId);
			if ($infectedStudent['type'] !== USER_TYPE_STUDENT) {
				throw new ErrorException('Wrong user inserted.');
			}

			[$fileName, $outputFileContents] = generateCTR($requestedFormat, $infectedStudent);

			header("Content-disposition: attachment; filename=" . $fileName);
			header("Content-type: " . $contentTypes[$requestedFormat]);
			echo $outputFileContents;
		} catch (Exception $e) {
			echo json_encode([
				'success' => false,
				'reason' => $e->getMessage(),
				'line' => $e->getLine()
			], JSON_INVALID_UTF8_SUBSTITUTE);
		}
	}
}

if (!function_exists('generateCTR')) {
	function generateCTR($fmt, $student) {

		$now = new DateTime();

		$fileName = $now->format('Y-m-d') . "-s${student['userId']}.${fmt}";

		$contactData = getContactInformation($student['userId'], $now->getTimestamp());

		switch ($fmt) {
			case 'pdf':
				$fileContents = formatInPdf($contactData, $now, $student);
				break;
			case 'csv':
				$fileContents = formatInCsv($contactData);
				break;

			default:
				throw new ErrorException("Wrong format requested.");
				break;
		}

		return [$fileName, $fileContents];
	}
}

if (!function_exists('formatInPdf')) {
	function formatInPdf($table, $date, $infectedData) {
		return formatInCsv($table);
	}
}

if (!function_exists('formatInCsv')) {
	function formatInCsv($table) {

		if (empty($table)) {
			return "";
		}

		$out = implode(",", array_keys($table[0])) . PHP_EOL;
		foreach ($table as $r) {
			$out .= implode(",", $r) . PHP_EOL;
		}

		return $out;
	}
}
