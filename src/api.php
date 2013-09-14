<?php
error_reporting(E_ALL);
@include_once("./auth.php");
@include_once("./rest/entrymanager.php");

$entryManager = new EntryManager();

if (isset($_SERVER['REQUEST_METHOD'])) {
	$action = '';
	$user = "";
	
	// Get the action (set by url rewrite). This parameter is part of the GET request regardless of request type.
	if (isset($_GET['action'])) {
		$action = $_GET['action'];
	}
	switch ($_SERVER['REQUEST_METHOD']) {
		case 'GET':
			if (isset($_GET["debug"])) {
				// Use for checking if url rewrite pass correct parameters
				print_r($_GET);
			}
			switch ($action) {
				case 'entry':
					if (isset($_GET['token'])) {
						$user = $_GET['token']; // TODO: Translate to actual user ID
					}
					$entryManager->handleGet($user);
					break;
			}
			break;
		case 'POST':
			$postaction = '';
			if (isset($_POST['action'])) {
				$postaction = $_POST['action'];
			}
			switch ($postaction) {
				case 'auth':
					$isAuth = Auth::authenticate($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
					echo $isAuth;
					break;
			}

			break;
		case 'PUT':
			parse_str(file_get_contents('php://input'), $_PUT);
			switch ($action) {
				case 'entry':
					$user = $_PUT['token']; // TODO: Translate to actual user ID
					$entryManager->handlePut($user, $_PUT);
					break;
			}
			break;
		case 'DELETE':
			parse_str(file_get_contents('php://input'), $_DELETE);
			switch ($action) {
				case 'entry':
					$user = $_DELETE['token']; // TODO: Translate to actual user ID
					$entryManager->handleDelete($user, $_DELETE);
					break;
			}
			break;
	}
}

?>