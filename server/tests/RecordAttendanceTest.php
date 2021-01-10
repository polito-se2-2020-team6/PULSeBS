<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class RecordAttendanceTest extends TestCase {

	public static function setUpBeforeClass(): void {
		copy('../db.sqlite', '../db.sqlite.backup');
	}

	protected function setUp(): void {
		copy('../testdb.sqlite', '../db.sqlite');
	}

	protected function tearDown(): void {
	}

	public static function tearDownAfterClass(): void {
		copy('../db.sqlite.backup', '../db.sqlite');
		unlink('../db.sqlite.backup');
	}

	private function createLecture($courseId, $roomId, $startTs, $endTs, $settings) {
		$pdo = new PDO('sqlite:../db.sqlite');

		$query = 'INSERT INTO lectures (course_id, room_id, start_ts, end_ts, settings) VALUES (:courseId, :roomId, :startTs, :endTs, :settings);';

		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':courseId', intval($courseId), PDO::PARAM_INT);
		$stmt->bindValue(':roomId', intval($roomId), PDO::PARAM_INT);
		$stmt->bindValue(':startTs', intval($startTs), PDO::PARAM_INT);
		$stmt->bindValue(':endTs', intval($endTs), PDO::PARAM_INT);
		$stmt->bindValue(':settings', intval($settings), PDO::PARAM_INT);

		$stmt->execute();

		return $pdo->lastInsertId();
	}

	// DOES NO CHECK WHATSOEVER ABOUT STUDENT FOLLOWING THE COURSE
	private function book($lectureId, $userId, $bookingTs, $cancellationTs, $attended) {
		$pdo = new PDO('sqlite:../db.sqlite');

		$query = 'INSERT INTO bookings (lecture_id, user_id, booking_ts, cancellation_ts, attended) VALUES (:lectureId, :userId, :bookingTs, :cancellationTs, :attended);';

		$stmt = $pdo->prepare($query);
		$stmt->bindValue(':lectureId', intval($lectureId), PDO::PARAM_INT);
		$stmt->bindValue(':userId', intval($userId), PDO::PARAM_INT);
		$stmt->bindValue(':bookingTs', intval($bookingTs), PDO::PARAM_INT);
		$stmt->bindValue(':cancellationTs', $cancellationTs, PDO::PARAM_INT);
		$stmt->bindValue(':attended', intval($attended), PDO::PARAM_INT);

		return $stmt->execute();
	}

	// Record attendance of student
	public function testRecordAttendance_1() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Record non attendance of student
	public function testRecordAttendance_2() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 1));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => false);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Record attendance of student already attending
	public function testRecordAttendance_3() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 1));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Record non attendance of student not already attending
	public function testRecordAttendance_4() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => false);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Record attendance of student of another teacher's course
	public function testRecordAttendance_5() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'antoniov',
			'password' => '987654321',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Record attendance of not existing lecture
	public function testRecordAttendance_6() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$lectureId += 1;
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Record attendance of not booked student
	public function testRecordAttendance_7() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Record attendance of lecture one week in the past
	public function testRecordAttendance_8() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time() - (7 * 24 * 60  * 60);
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Record attendance of lecture one week in the future
	public function testRecordAttendance_9() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time() + (7 * 24 * 60  * 60);
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// login as student
	public function testRecordAttendance_10() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'alessandrob',
			'password' => 'passw2',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// login as booking manager
	public function testRecordAttendance_11() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time() + (7 * 24 * 60  * 60);
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// login as support officer
	public function testRecordAttendance_12() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time() + (7 * 24 * 60  * 60);
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Not authenticated
	public function testRecordAttendance_13() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time() + (7 * 24 * 60  * 60);
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(403, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}

	// Record attendance of student who cancelled
	public function testRecordAttendance_14() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 1, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, $now - 59, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Record attendance of student in waiting list
	public function testRecordAttendance_15() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$now = time();
		$lectureId = $this->createLecture(1, 2, $now, $now + (90 * 60), 0);
		$userId = 4;
		$this->assertTrue($this->book($lectureId, $userId, $now - 60, null, 0));

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array('attended' => true);
		$response = $client->request('PATCH', API_PATH . "/api/lectures/{$lectureId}/students/{$userId}", array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}
}
