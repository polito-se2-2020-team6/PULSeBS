<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class UploadEnrollmentsTest extends TestCase {

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

	// Support officer inserts enrollments
	public function test_upload_enrollments_1() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array(
			'text' => 'Code,Student\n1234,1'
		);
		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'form_params' => $data,
				'cookies' => $jar
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Support officer inserts enrollments (but data is courses)
	public function test_upload_enrollments_2() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array(
			'text' => 'Code,Year,Semester,Course,Teacher\nXY1211,1,1,Metodi di finanziamento delle imprese,d2\nXY4911,1,1,Chimica,d3'
		);
		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'form_params' => $data,
				'cookies' => $jar
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Support officer inserts enrollments, but Student is teacher
	public function test_upload_enrollments_3() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array(
			'text' => 'Code,Student\n1234,2'
		);
		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'form_params' => $data,
				'cookies' => $jar
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Support officer inserts enrollments, but Course does not exist
	public function test_upload_enrollments_4() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array(
			'text' => 'Code,Student\n865453435,1'
		);
		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'form_params' => $data,
				'cookies' => $jar
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Support officer inserts enrollments, but Student not in db
	public function test_upload_enrollments_5() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$data = array(
			'text' => 'Code,Student\n2,997416'
		);
		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'form_params' => $data,
				'cookies' => $jar
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Support officer inserts enrollments, no sent data
	public function test_upload_enrollments_6() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'suppofr',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'cookies' => $jar
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Not authenticated
	public function test_upload_enrollments_7() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'text' => 'Code,Student\n2,1'
		);
		$response = $client->request(
			'POST',
			API_PATH . '/api/enrollments/upload',
			array(
				'form_params' => $data,
				'cookies' => $jar
			)
		);
		$this->assertEquals(403, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}
}
