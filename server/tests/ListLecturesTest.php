<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

$data = array(
	'username' => 'francescop',
	'password' => '123456789',
);

define('API_PATH', 'http://127.0.0.1:8080/API/REST.php');

class ListLecturesTest extends TestCase {

	// Test API endpoint when logged in as student (200)
	public function test_list_1() {
		$client = new Client();

		$data = array(
			'username' => 'francescop',
			'password' => '123456789',
		);
		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', array('form_params' => $data));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/1/lectures', array());
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('lectures', $data);
		$this->assertEquals(5, count($data['lectures']));
	}

	// Test API endpoint when logged in as teacher (200)
	public function test_list_2() {
		$client = new Client();

		$data = array(
			'username' => 'marcot',
			'password' => 'passw1',
		);
		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', array('form_params' => $data));
		$this->assertEquals(200, $response->getStatusCode());

		$response = $client->request('GET', API_PATH . '/api/users/2/lectures');
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);

		$this->assertArrayHasKey('lectures', $data);
		$this->assertEquals(4, count($data['lectures']));
	}

	// Test API endpoint  when not logged in (403)
	public function test_list_3() {
		$client = new Client();

		$response = $client->request('GET', API_PATH . '/api/users/5/lectures');
		$this->assertEquals(403, $response->getStatusCode());
	}
}
