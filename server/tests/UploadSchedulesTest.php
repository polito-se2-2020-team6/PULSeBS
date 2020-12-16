<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class UploadSchedulesTest extends TestCase {

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

	// Support officer inserts schedules fo one week
	public function test_upload_schedules_1() {
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
			API_PATH . '/api/schedules/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'schedule_file',
						'contents' => "Code,Room,Day,Seats,Time\nABCD,1,Mon,60,8:30-10:00\nABCD,1,Tue,60,11:30-13:00",
						'filename' => 'schedule_file'
					],
					[
						'name' => 'startDay',
						'contents' => '2020-10-10'
					],
					[
						'name' => 'endDay',
						'contents' => '2020-10-17'
					]
				]
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Support officer inserts schedules (no dates provided)
	public function test_upload_schedules_2() {
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
			API_PATH . '/api/schedules/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'schedule_file',
						'contents' => "Code,Room,Day,Seats,Time\nABCD,1,Mon,60,8:30-10:00\nABCD,1,Tue,60,11:30-13:00",
						'filename' => 'schedule_file'
					]
				]
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}

	// Support officer inserts schedules (no file provided)
	public function test_upload_schedules_3() {
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
			API_PATH . '/api/schedules/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'startDay',
						'contents' => '2020-10-10'
					],
					[
						'name' => 'endDay',
						'contents' => '2020-10-17'
					]
				]
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}

	// Not authenticated
	public function test_upload_schedules_4() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$response = $client->request(
			'POST',
			API_PATH . '/api/schedules/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'schedule_file',
						'contents' => "Code,Room,Day,Seats,Time\nABCD,1,Mon,60,8:30-10:00\nABCD,1,Tue,60,11:30-13:00",
						'filename' => 'schedule_file'
					],
					[
						'name' => 'startDay',
						'contents' => '2020-10-10'
					],
					[
						'name' => 'endDay',
						'contents' => '2020-10-17'
					]
				]
			)
		);
		$this->assertEquals(403, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}
}
