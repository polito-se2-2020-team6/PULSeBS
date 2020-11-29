<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class StatsBookingsTest extends TestCase {

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

	// Teacher gets lecture stats
	public function test_stats_1() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?lecture=1', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('courseId', $data);
		$this->assertArrayHasKey('bookingsAvg', $data);
		$this->assertArrayHasKey('bookingsStdDev', $data);
		$this->assertArrayHasKey('totalBookings', $data);
		$this->assertArrayHasKey('nLectures', $data);

		$this->assertTrue($data['bookingsAvg'] == $data['totalBookings']);
		$this->assertEquals(0, $data['bookingsStdDev']);
		$this->assertEquals(1, $data['nLectures']);
	}


	// Teacher gets week stats
	public function test_stats_2() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?period=week&week=13&year=2020', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('courseId', $data);
		$this->assertArrayHasKey('bookingsAvg', $data);
		$this->assertArrayHasKey('bookingsStdDev', $data);
		$this->assertArrayHasKey('totalBookings', $data);
		$this->assertArrayHasKey('nLectures', $data);

		$this->assertEquals(0, $data['courseId']);
		$this->assertEquals(0, $data['bookingsAvg']);
		$this->assertEquals(0, $data['bookingsStdDev']);
		$this->assertEquals(0, $data['totalBookings']);
		$this->assertEquals(0, $data['nLectures']);
	}

	// Teacher gets month stats
	public function test_stats_3() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?period=month&month=8&year=2020', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('courseId', $data);
		$this->assertArrayHasKey('bookingsAvg', $data);
		$this->assertArrayHasKey('bookingsStdDev', $data);
		$this->assertArrayHasKey('totalBookings', $data);
		$this->assertArrayHasKey('nLectures', $data);

		$this->assertEquals(0, $data['courseId']);
		$this->assertEquals(0, $data['bookingsAvg']);
		$this->assertEquals(0, $data['bookingsStdDev']);
		$this->assertEquals(0, $data['totalBookings']);
		$this->assertEquals(0, $data['nLectures']);
	}

	// Teacher gets overall stats
	public function test_stats_4() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?period=all', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('courseId', $data);
		$this->assertArrayHasKey('bookingsAvg', $data);
		$this->assertArrayHasKey('bookingsStdDev', $data);
		$this->assertArrayHasKey('totalBookings', $data);
		$this->assertArrayHasKey('nLectures', $data);

		$this->assertEquals(0, $data['courseId']);
		$this->assertEquals(0, $data['bookingsAvg']);
		$this->assertEquals(0, $data['bookingsStdDev']);
		$this->assertEquals(0, $data['totalBookings']);
		$this->assertEquals(0, $data['nLectures']);
	}

	// Teacher gets wrong lecture stats
	public function test_stats_5() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'antoniov',
			'password' => '987654321',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?lecture=1', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('courseId', $data);
		$this->assertArrayHasKey('bookingsAvg', $data);
		$this->assertArrayHasKey('bookingsStdDev', $data);
		$this->assertArrayHasKey('totalBookings', $data);
		$this->assertArrayHasKey('nLectures', $data);

		$this->assertEquals(0, $data['courseId']);
		$this->assertEquals(0, $data['bookingsAvg']);
		$this->assertEquals(0, $data['bookingsStdDev']);
		$this->assertEquals(0, $data['totalBookings']);
		$this->assertEquals(0, $data['nLectures']);
	}

	// Teacher gets wrong course stats
	public function test_stats_6() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'antoniov',
			'password' => '987654321',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?course=1', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('courseId', $data);
		$this->assertArrayHasKey('bookingsAvg', $data);
		$this->assertArrayHasKey('bookingsStdDev', $data);
		$this->assertArrayHasKey('totalBookings', $data);
		$this->assertArrayHasKey('nLectures', $data);

		$this->assertEquals(0, $data['courseId']);
		$this->assertEquals(0, $data['bookingsAvg']);
		$this->assertEquals(0, $data['bookingsStdDev']);
		$this->assertEquals(0, $data['totalBookings']);
		$this->assertEquals(0, $data['nLectures']);
	}

	// Student gets stats
	public function test_stats_7() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$data = array(
			'username' => 'alessandrob',
			'password' => 'passw2',
		);
		$response = $client->request('POST', API_PATH . '/api/login', array('form_params' => $data, 'cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/stats?lecture=1', array('cookies' => $jar));
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
		$this->assertEquals('Permission denied.', $data['reason']);
	}

	// Unauthenticated
	public function test_stats_8() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$response = $client->request('GET', API_PATH . '/api/stats?lecture=1', array('cookies' => $jar));
		$this->assertEquals(403, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);

		$this->assertArrayHasKey('reason', $data);
	}
}
