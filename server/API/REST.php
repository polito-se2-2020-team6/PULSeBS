<?php
session_start();
require_once "../vendor/autoload.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, GET, POST");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Content-Type: application/json");

define("API_PATH", $_SERVER["SCRIPT_NAME"] . "/api");

/* Constant defining */

define("USER_TYPE_STUDENT", 0);
define("USER_TYPE_TEACHER", 1);


define('LECTURE_CANCELLED', 0x2);

/* Turning warning and notices into exceptions */

set_error_handler(function ($errno, $errstr, $errfile, $errline) {
	// error was suppressed with the @-operator
	if (0 === error_reporting()) {
		return false;
	}

	throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

/* Utilities */

if (!function_exists("check_login")) {
	/**
	 * Check if a user is logged
	 * 
	 * @return bool true if is logged, false otherwise
	 */
	function check_login() {
		$pdo = new PDO("sqlite:../db.sqlite");

		if (!isset($_SESSION["user_id"]) || !isset($_SESSION["nonce"])) {
			return false;
		}

		$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE ID = :userId");
		$stmt->bindValue(":userId", $_SESSION["user_id"], PDO::PARAM_INT);

		if (!$stmt->execute()) {
			throw new Error($stmt->errorInfo(), $stmt->errorCode());
		}

		$user_data = $stmt->fetch();

		return $_SESSION["nonce"] == md5(serialize($user_data)) && intval($_SESSION['user_id']) == intval($user_data['ID']);
	}
}


/* Functions that implements endpoints */

if (!function_exists("do_login")) {
	function do_login($vars) {
		try {
			$pdo = new PDO("sqlite:../db.sqlite");

			$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE username = :username");
			$stmt->bindValue(":username", $_POST["username"]);

			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}

			$user_data = $stmt->fetch();

			if (!password_verify($_POST["password"], $user_data["password"])) {
				http_response_code(403);
				echo json_encode(array('success' => false));
				return;
			} else {
				//TODO da trasformare in un vero nonce da salvare nel db
				$nonce = md5(serialize($user_data));

				$_SESSION['user_id'] = $user_data["ID"];
				$_SESSION['nonce'] = $nonce;

				echo json_encode(array("success" => true, "userId" =>
				$user_data['ID'], 'type' => $user_data['type']));

				return;
			}
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

if (!function_exists('am_i_logged')) {
	function am_i_logged() {
		if (!check_login()) {
			http_response_code(403);
			echo json_encode(array('success' => true, 'loggedIn' => false));
		} else
			echo json_encode(array('success' => true, 'loggedIn' => true));
	}
}

if (!function_exists('do_logout')) {
	function do_logout($vars) {
		unset($_SESSION['nonce']);
		unset($_SESSION['user_id']);

		echo json_encode(array('success' => true));
	}
}

if (!function_exists('print_types')) {
	function print_types($vars) {
		echo json_encode(array('success' => true, 'list' => array(
			array("typeId" => USER_TYPE_STUDENT, 'typeDesc' => 'student'),
			array("typeId" => USER_TYPE_TEACHER, 'typeDesc' => 'teacher')
		)));
	}
}

if (!function_exists('print_myself')) {
	function print_myself($vars) {
		try {
			$pdo = new PDO("sqlite:../db.sqlite");

			$stmt = $pdo->prepare("SELECT ID, username, password, type FROM users WHERE ID = :userId");
			$stmt->bindValue(":userId", $_SESSION["user_id"], PDO::PARAM_INT);

			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}

			$user_data = $stmt->fetch();

			echo json_encode(array(
				'success' => true,
				'userId' => intval($user_data['ID']),
				'type' => intval($user_data['type']),
				'username' => $user_data['username'],
				'email' => $user_data['email'],
				'firstname' => $user_data['firstname'],
				'lastname' => $user_data['lastname'],
			));
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}



if (!function_exists('book_lecture')) {
	function book_lecture($vars) {
		$userId = intval($vars['userId']);

		try {
			if (!isset($_POST['lectureId'])) {
				throw new Error('Expected lectureId parameter.');
			}

			$lectureId = intval($_POST['lectureId']);
			$pdo = new PDO("sqlite:../db.sqlite");

			// Check user exists and is student
			$stmt = $pdo->prepare('SELECT * FROM users WHERE ID = :userId AND type = :student');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':student', USER_TYPE_STUDENT, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}
			if (!$stmt->fetch()) {
				throw new Error('Student ' . $userId . ' not found.');
			}

			// Check lecture exists and deadline for booking is not met (23.00 of day before)
			$stmt = $pdo->prepare('SELECT *
								   FROM lectures
								   WHERE ID = :lectureId 
										AND settings & :cancelled = 0');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':cancelled', LECTURE_CANCELLED, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}
			$lecture = $stmt->fetch();
			if (!$lecture) {
				throw new Error('Lecture ' . $userId . ' not found.');
			}

			// Check for timezones discrepancies
			$bookingDeadline = new DateTime();
			$bookingDeadline->setTimestamp(intval($lecture['start_ts']));
			$bookingDeadline->modify('-1 day')->setTime(23, 0, 0);
			$now = time();

			if ($now >= $bookingDeadline) {
				throw new Error('Booking s for lecture ' . $lectureId . ' are closed.');
			}

			// Check student is following the course of the lecture
			$stmt = $pdo->prepare('SELECT *
								   FROM lectures L, course_subsrciptions CS
								   WHERE L.course_id = CS.course_id
									   AND L.ID = :lectureId
									   AND user_id = :userId');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}
			if (!$stmt->fetch()) {
				throw new Error('Student ' . $userId . ' is not following course of lecture ' . $lectureId . '.');
			}

			// Check student is not currently booked
			$stmt = $pdo->prepare('SELECT * 
								   FROM bookings 
								   WHERE user_id = :userId
										   AND lecture_id = :lectureId
										   AND cancellation_ts IS NULL');
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}
			if ($stmt->fetch()) {
				throw new Error('Student ' . $userId . ' has already booked for lecture ' . $lectureId . '.');
			}

			// Book to lecture
			$stmt = $pdo->prepare('INSERT INTO bookings (lecture_id, user_id, booking_ts, cancellation_ts, attended) 
								   VALUES (:lectureId, :userId, :bookingTs, NULL, NULL)');
			$stmt->bindValue(':lectureId', $lectureId, PDO::PARAM_INT);
			$stmt->bindValue(':userId', $userId, PDO::PARAM_INT);
			$stmt->bindValue(':bookingTs', $now, PDO::PARAM_INT);
			if (!$stmt->execute()) {
				throw new Error($stmt->errorInfo(), $stmt->errorCode());
			}

			// Success
			echo json_encode(array('success' => true));
		} catch (Exception $e) {
			echo json_encode(array('success' => false, 'reason' => $e->getMessage()));
		}
	}
}

/*Documentation for FastRoute can be found here: https://github.com/nikic/FastRoute */

/*Constants to define option for the routes*/

define("NEED_AUTH", 0); //if set, the route needs $_SESSION['nonce'] to be set and valid

//define the routes
$dispatcher = FastRoute\simpleDispatcher(function (FastRoute\RouteCollector $r) {
	$r->addRoute('POST', API_PATH . '/login', 'do_login');
	$r->addRoute('GET', API_PATH . '/logged', 'am_i_logged');
	$r->addRoute('POST', API_PATH . '/logout', ['do_logout', NEED_AUTH]);
	$r->addRoute('GET', API_PATH . "/types", "print_types");

	/* users route */
	$r->addRoute('GET', API_PATH . '/user/me', ['print_myself', NEED_AUTH]);

	$r->addRoute('POST', API_PATH . '/users/{userId:\d+}/book', ['book_lecture', NEED_AUTH]);
});

// Fetch method and URI from somewhere
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Strip query string (?foo=bar) and decode URI
if (false !== $pos = strpos($uri, '?')) {
	$uri = substr($uri, 0, $pos);
}
$uri = rawurldecode($uri);

$routeInfo = $dispatcher->dispatch($httpMethod, $uri);
switch ($routeInfo[0]) {
	case FastRoute\Dispatcher::NOT_FOUND:
		http_response_code(404);
		break;
	case FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
		$allowedMethods = $routeInfo[1];
		http_response_code(405);
		// ... 405 Method Not Allowed
		break;
	case FastRoute\Dispatcher::FOUND:
		if (!is_array($routeInfo[1])) {
			$handler = $routeInfo[1];
			$vars = $routeInfo[2];
			$handler($vars);
		} else {
			$ok = true;
			for ($i = 1; $i < count($routeInfo[1]); $i++) {
				switch ($routeInfo[1][$i]) {
					case NEED_AUTH:
						if (!check_login()) {
							$ok = false;
							http_response_code(403);
						}
						break;
					default:
						break;
				}
				if (!$ok) break;
			}

			$handler = $routeInfo[1][0];
			$vars = $routeInfo[2];
			$handler($vars);
		}
		break;
	default:
		http_response_code(404);
		break;
}
