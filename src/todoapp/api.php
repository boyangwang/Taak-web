<?php
$db = new PDO('mysql:host=localhost;dbname=deployas3;chatset=utf8', 'deployas3', 'deployas3');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
if (isset($_SERVER['REQUEST_METHOD'])) {
	switch($_SERVER['REQUEST_METHOD']) {
		case 'GET':
			if (isset($_GET["user"])) {
				echo json_encode(getEntries($_GET["user"]));
			}
			break;
		case 'POST':
			break;
		case 'PUT':
			parse_str(file_get_contents('php://input'), $_PUT);
			if (isset($_PUT['entry'])) {
				$entry = json_decode($_PUT['entry'],true);
				echo json_encode(addEntry($_PUT['user'], $entry));
			}
			print_r($_PUT);
			break;
		case 'DELETE':
			parse_str(file_get_contents('php://input'), $_DELETE);
			if (isset($_DELETE["id"])) {
				echo json_encode(deleteEntry(getEntries($_DELETE["id"])));
			}
			break;
	}
}


function addEntry($user, $entry) {
	global $db;
	// TODO: Use prepared statements
	//$raw = json_decode($entry);
	$id = $db->quote($entry['id']);
	$user = $db->quote($user);
	$value = $db->quote(json_encode($entry));
	$query = "INSERT INTO entries(id, user, value) VALUES($id, $user, $value) ON DUPLICATE KEY UPDATE value=$value";
	echo $query;
	$db->exec($query) or die();
	$result["code"] = "200";
	return $result;
}

function deleteEntry($id) {
	global $db;
	$id = $db->quote($id);
	//$query = "DELETE FROM entries WHERE id=$id";
	$query = "UPDATE entries SET value='' WHERE id=$id";
	$db->exec($query);
	
	$result["code"] = "200";
	return $result;
}

function getEntries($user) {
	global $db;
	$id = $db->quote($entry['id']);
	$query = "SELECT * FROM entries WHERE id=$id";
	$result = $db->query($query);
	return $result->fetchAll(PDO::FETCH_ASSOC);
}

function authenticate($user, $password) {

}
?>