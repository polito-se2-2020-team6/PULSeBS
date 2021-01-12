<?php
require_once "../functions.php";


switch ($argv[1]) {
	case "send_booking_number_notifications":
		$is_web = http_response_code() !== FALSE;

		if (!$is_web) {
			die();
		}

		$start_time = new DateTime('tomorrow', new DateTimeZone($server_default_timezone));
		$end_time = clone $start_time;
		$end_time->modify(("+1 day"));

		$db = new PDO(DB_PATH);

		$stmt = $db->prepare("SELECT users.email, users.firstname, users.lastname, courses.name AS course_name, COUNT(*) AS booking_num FROM users, lectures, courses, bookings WHERE
			users.id = courses.teacher_id AND courses.ID = lectures.course_id AND lectures.ID = bookings.lecture_id AND bookings.cancellation_ts IS NULL AND
			lectures.start_ts >= :startTs AND lectures.start_ts < :endTs");
		$stmt->bindValue(":startTs", $start_time->getTimestamp());
		$stmt->bindValue(":endTs", $end_time->getTimestamp());

		if (!$stmt->execute()) {
			throw new PDOException($stmt->errorInfo(), $stmt->errorCode());
		}

		while ($data = $stmt->fetch()) {
			mail(
				$data["email"],
				'[' . $data['course_name'] . '] Booking Notice',
				"Dear " . $data["lastname"] . " " . $data["firstname"] . ",\n" . $data["booking_num"] . " have booked for the lecture of " . $data["course_name"] . ".\nKind Regards"
			);
		}

		break;
	default:
		break;
}
