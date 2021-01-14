<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class GetContactTracingReportTest extends TestCase {

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

	// Student with id = 1 reported positive
	public function testGetContactTracingReport_1() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
	}

	// Student with id = 1 reported positive
	public function testGetContactTracingReport_2() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/CTReport/pdf', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
	}

	// Student with id = 2 reported positive, but it is a teacher
	public function testGetContactTracingReport_3() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/2/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Non existing student reported positive
	public function testGetContactTracingReport_4() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/90/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Make request as teacher
	public function testGetContactTracingReport_5() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Make request as student
	public function testGetContactTracingReport_6() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'alessandrob',
			'password' => 'passw2',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Make request as support officer
	public function testGetContactTracingReport_7() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);

		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Not authenticated
	public function testGetContactTracingReport_8() {
		// create our http client (Guzzle)
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$response = $client->request('GET', API_PATH . '/api/users/1/CTReport/csv', array('cookies' => $jar));
		$this->assertEquals(403, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}
}
