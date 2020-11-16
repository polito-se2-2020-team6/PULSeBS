<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class LoginTest extends TestCase {

	public function testLogin() {
		// create our http client (Guzzle)
		$client = new Client();

		$data = array(
			'username' => 'francescop',
			'password' => '123456789',
		);

		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', array('form_params' => $data));

		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);
		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
		$this->assertArrayHasKey('userId', $data);
		$this->assertEquals(1, $data['userId']);
		$this->assertArrayHasKey('type', $data);
		$this->assertEquals(0, $data['type']);
	}
}
