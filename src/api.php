<?php
error_reporting(E_ALL);
$db = new PDO('mysql:host=localhost;dbname=deployas3;chatset=utf8', 'deployas3', 'deployas3');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
if (isset($_SERVER['REQUEST_METHOD'])) {
	switch($_SERVER['REQUEST_METHOD']) {
		case 'GET':
			if (isset($_GET["token"])) {
				echo json_encode(getEntries($_GET["token"]));
			}
			break;
		case 'POST':
			$header = $_SERVER['HTTP_X_REQUESTED_WITH'];			
//			$isAuth = authenticate();
			echo $header;
			break;
		case 'PUT':
			parse_str(file_get_contents('php://input'), $_PUT);
			//print_r($_PUT);
			if (isset($_PUT['token']) && isset($_PUT['entries'])) {
				//print_r($_PUT['entries']);
				//$entry = json_decode($_PUT['entry'],true);
				//echo json_encode(addEntry($_PUT['user'], $entry));
				echo json_encode(addEntries($_PUT['token'], $_PUT['entries']));
			}
			break;
		case 'DELETE':
			parse_str(file_get_contents('php://input'), $_DELETE);
			if (isset($_DELETE["id"])) {
				//echo json_encode(deleteEntry(getEntries($_DELETE["id"])));
			}
			break;
	}
}

/**  Adding entries **/
function addEntries($token, $entries) {
	$user = $token; // TODO: use actual user id
	$message = "";
	foreach ($entries as $entry) {
		$queryResult = addEntry($user, $entry);
		if ($queryResult) {
			$message .= $entry["id"]." is updated\n";
		}
	}
	$result["code"] = 200;
	$result["message"] = $message;
	return $result;
}

function addEntry($user, $entry) {
	global $db;
	// TODO: Use prepared statements
	$id = $db->quote($entry['id']);
	$user = $db->quote($user);
	$value = $db->quote(json_encode($entry));
	$query = "INSERT INTO entries(id, user, value) VALUES($id, $user, $value) ON DUPLICATE KEY UPDATE id=$id, user=$user, value=$value;";
	//echo $query;
	$result = $db->exec($query);
	if ($result != null) {
		return true;
	} else {
		return false;
	}
}

function deleteEntries($token, $entries) {
	$user = $token; // TODO: use actual user id
	foreach ($entries as $entry) {
		deleteEntry($user, $entry["id"]);
	}
	$result["code"] = 200;
	$result["message"] = "success";
	return $result;
}

function deleteEntry($user, $id) {
	global $db;
	$id = $db->quote($id);
	//$query = "DELETE FROM entries WHERE id=$id";
	// Use UPDATE to allow for synchronization after delete online on another device
	$query = "UPDATE entries SET value='' WHERE id=$id";
	$db->exec($query);
	return true;
}

function getEntries($token) {
	global $db;
	$user = $token; // TODO: use actual user id
	$user = $db->quote($user);
	$query = "SELECT value FROM entries WHERE user=$user";
	$result = $db->query($query);
	return $result->fetchAll(PDO::FETCH_ASSOC);
}

function authenticate($user, $password) {
	// Should check with db here
	// for now dummy
	$authPwd = getPwdByUsername();
	
	if ($authPwd == $password) {
		return true;
	}
	else {
		return false;
	}
}

function getPwdByUsername($user) {
	
}
?>