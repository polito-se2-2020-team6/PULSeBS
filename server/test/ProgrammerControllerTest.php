<?php

use PHPUnit\Framework\TestCase;

// namespace KnpU\CodeBattle\Tests;

use Guzzle\Http\Client;

class ProgrammerControllerTest extends TestCase {

	public function testPOST() {
		// create our http client (Guzzle)
		$client = new Client('http://127.0.0.1:8080', array(
			'request.options' => array(
				'exceptions' => false,
			)
		));

		$data = array(
			'username' => 'francescop',
			'password' => '12345689',
		);

		$request = $client->post('/API/REST.php/api/login', null, json_encode($data));
		$response = $request->send();

		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);
		$this->assertArrayHasKey('success', $data);
	}
}
