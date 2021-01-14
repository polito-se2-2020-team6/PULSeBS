<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class GetStudentInfoTest extends TestCase {

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

	// Get student with id = 1
	public function testGetStudentInfo_1() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/1/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
		$this->assertArrayHasKey('userId', $data);
		$this->assertEquals(1, $data['userId']);
		$this->assertArrayHasKey('type', $data);
		$this->assertEquals(0, $data['type']);
	}

	// Get student with ssn = abc
	public function testGetStudentInfo_2() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/abc/ssn', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
		$this->assertArrayHasKey('userId', $data);
		$this->assertEquals(4, $data['userId']);
		$this->assertArrayHasKey('type', $data);
		$this->assertEquals(0, $data['type']);
	}

	// Get student with id = 2, but it is not a student
	public function testGetStudentInfo_3() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/2/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student with ssn = bca, but it is not a student
	public function testGetStudentInfo_4() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/bca/ssn', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student with wrong id
	public function testGetStudentInfo_5() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/90/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student with wrong ssn
	public function testGetStudentInfo_6() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/cba/ssn', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student with ssn = 1
	public function testGetStudentInfo_7() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/1/ssn', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student with id = abc
	public function testGetStudentInfo_8() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/abc/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student with wrong field name
	public function testGetStudentInfo_9() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/abc/snn', array('cookies' => $jar));
		$this->assertEquals(404, $response->getStatusCode());
	}

	// Get student, but authentication as student
	public function testGetStudentInfo_10() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'alessandrob',
			'password' => 'passw2',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/1/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student, but authentication as teacher
	public function testGetStudentInfo_11() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/1/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Get student, but authentication as support officer
	public function testGetStudentInfo_12() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/students/1/id', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Unauthenticated
	public function testGetStudentInfo_13() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$response = $client->request('GET', API_PATH . '/api/students/1/id', array('cookies' => $jar));
		$this->assertEquals(403, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}
}
