<?php

use Fpdf\Fpdf;

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
		$pdf = new Fpdf();
		$pdf->AddPage('L');
		$pdf->SetFont('Arial', 'B', 16);

		$w = $pdf->GetStringWidth("Contact Tracing Report") + 6;
		$pdf->SetX((297 - $w) / 2);
		$pdf->Cell($w, 0, "Contact Tracing Report", 0, 0, 'C');
		$pdf->Ln(10);

		$pdf->SetFont('Arial', 'B', 14);
		$w = $pdf->GetStringWidth("Affected Student: " . $infectedData['lastname'] . " " . $infectedData['firstname']) + 6;
		$pdf->SetX((297 - $w) / 2);
		$pdf->Cell($w, 0, "Affected Student: " . $infectedData['lastname'] . " " . $infectedData['firstname'], 0, 0, 'C');
		$pdf->Ln(10);

		$pdf->Cell(297 - 20, 0, "Report generated on " . $date->format('Y-m-d'), 0, 0, 'R');
		$pdf->Ln(20);

		// Colors, line width and bold font
		$pdf->SetFillColor(255, 0, 0);
		$pdf->SetDrawColor(128, 0, 0);
		$pdf->SetLineWidth(.3);
		$pdf->SetFont('Arial', 'B', 12);

		if (empty($table)) {
			$pdf->Cell(40, 0, "No contact with other students.");
		} else {
			// Header
			$pdf->SetTextColor(255);
			$w = array(15, 30, 30, 25, 25, 35, 60, 60);
			for ($i = 0; $i < count(array_keys($table[0])); $i++) {
				$pdf->Cell($w[$i], 7, array_keys($table[0])[$i], 1, 0, 'C', true);
			}
			$pdf->Ln();
			// Color and font restoration
			$pdf->SetFillColor(224, 235, 255);
			$pdf->SetTextColor(0);
			$pdf->SetFont('Arial', '', 10);
			// Data
			$fill = false;
			foreach ($table as $row) {
				$pdf->Cell($w[0], 6, $row['ID'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[1], 6, $row['First name'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[2], 6, $row['Last name'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[3], 6, $row['City'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[4], 6, $row['Birthday'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[5], 6, $row['SSN'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[6], 6, $row['Email'], 'LR', 0, 'L', $fill);
				$pdf->Cell($w[7], 6, $row['Last contact'], 'LR', 0, 'L', $fill);
				$pdf->Ln();
				$fill = !$fill;
			}
			// Closing line
			$pdf->Cell(array_sum($w), 0, '', 'T');
		}

		return $pdf->Output('S');
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
