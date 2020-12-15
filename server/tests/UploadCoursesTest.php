<?php

use PHPUnit\Framework\TestCase;

use GuzzleHttp\Client;

class UploadCoursesTest extends TestCase {

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

	// Support officer inserts courses
	public function test_upload_courses_1() {
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
			API_PATH . '/api/courses/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'course_file',
						'contents' => "Code,Year,Semester,Course,Teacher\nXY1211,1,1,Metodi di finanziamento delle imprese,d2\nXY4911,1,1,Chimica,d3",
						'filename' => 'course_file'
					]
				]
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertTrue($data['success']);
	}

	// Support officer inserts courses, but dXXXXXX not teacher
	public function test_upload_courses_2() {
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
			API_PATH . '/api/courses/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'course_file',
						'contents' => "Code,Year,Semester,Course,Teacher\nXY1211,1,1,Metodi di finanziamento delle imprese,d1\nXY4911,1,1,Chimica,d3",
						'filename' => 'course_file'
					]
				]
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Support officer inserts courses, but dXXXXXX not in db
	public function test_upload_courses_3() {
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
			API_PATH . '/api/courses/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'course_file',
						'contents' => "Code,Year,Semester,Course,Teacher\nXY1211,1,1,Metodi di finanziamento delle imprese,d2\nXY4911,1,1,Chimica,d444444",
						'filename' => 'course_file'
					]
				]
			)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}

	// Not authenticated
	public function test_upload_courses_4() {
		$client = new Client(array('http_errors' => false));
		$jar = new \GuzzleHttp\Cookie\CookieJar;

		$response = $client->request(
			'POST',
			API_PATH . '/api/courses/upload',
			array(
				'cookies' => $jar,
				'multipart' => [
					[
						'name' => 'course_file',
						'contents' => "Code,Year,Semester,Course,Teacher\nXY1211,1,1,Metodi di finanziamento delle imprese,d2\nXY4911,1,1,Chimica,d3",
						'filename' => 'course_file'
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

	// Support officer, no data sent
	public function test_upload_courses_5() {
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
			API_PATH . '/api/courses/upload',
			array('cookies' => $jar)
		);
		$this->assertEquals(200, $response->getStatusCode());
		$data = json_decode($response->getBody(true), true);

		$this->assertArrayHasKey('success', $data);
		$this->assertFalse($data['success']);
	}
}
