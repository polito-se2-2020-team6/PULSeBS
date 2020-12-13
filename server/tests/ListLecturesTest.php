<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;


define('API_PATH', 'http://127.0.0.1:8080/API/REST.php');

class ListLecturesTest extends TestCase {

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

	// Test API endpoint when logged in as student (200)
	public function test_list_1() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'francescop',
			'password' => '123456789',
		);
		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/lectures', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('lectures', $data);
		$this->assertEquals(5, count($data['lectures']));
	}

	// Test API endpoint when logged in as teacher (200)
	public function test_list_2() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/2/lectures', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('lectures', $data);
		$this->assertEquals(5, count($data['lectures']));
	}

	// Test API endpoint  when not logged in (403)
	public function test_list_3() {
		$client = new Client(array('http_errors' => false));

		$response = $client->request('GET', API_PATH . '/api/users/5/lectures');
		$this->assertEquals(403, $response->getStatusCode());
	}

	// Test API endpoint when logged in as booking manager (200)
	public function test_list_4() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'bookman',
			'password' => '123123123',
		);
		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/5/lectures', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		var_dump($data);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('lectures', $data);
		$this->assertEquals(5, count($data['lectures']));
	}
}
