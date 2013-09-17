<?php

error_reporting(E_ALL);
//@include_once("./auth.php");
include_once("./rest/entrymanager.php");
include_once("./rest/usermanager.php");

$entryManager = new EntryManager();
$userManager = new UserManager();

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
					$user_from_token = $userManager->getUserFromTokenAll($_GET['token']);
					$entryManager->handleGet($user_from_token);
					break;
			}
			break;
		case 'POST':
			$postaction = $_GET['action'];
			
			switch ($postaction) {
				case 'auth':
					$user_from_token = $userManager->getUserFromTokenAll($_POST['token']);
					echo $user_from_token;
					break;
				case 'logout':
					$userManager->deleteRecord($_POST['token']);
					break;
			}

			break;
		case 'PUT':
			parse_str(file_get_contents('php://input'), $_PUT);
			switch ($action) {
				case 'entry':
					$user_from_token = $userManager->getUserFromTokenAll($_PUT['token']);
					$entryManager->handlePut($user_from_token, $_PUT);
					break;
			}
			break;
		case 'DELETE':
			parse_str(file_get_contents('php://input'), $_DELETE);
			switch ($action) {
				case 'entry':
					$user_from_token = $userManager->getUserFromTokenAll($_DELETE['token']);
					$entryManager->handleDelete($user_from_token, $_DELETE);
					break;
			}
			break;
	}
}

?>