<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class UnitTest extends TestCase {

	public function testPOST() {
		// create our http client (Guzzle)
		$client = new Client(array('baseUri' => 'http://127.0.0.1:8080'));

		$data = array(
			'username' => 'francescop',
			'password' => '12345689',
		);

		$response = $client->request('POST', 'http://127.0.0.1:8080/API/REST.php/api/login', $data);

		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);
		$this->assertArrayHasKey('success', $data);
	}
}
