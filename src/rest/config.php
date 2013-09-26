<?php
$dbsetting["host"] = "localhost";
$dbsetting["name"] = "deployas3";
$dbsetting["username"] = "deployas3";
$dbsetting["password"] = "deployas3";

function getDatabase() {
	global $dbsetting;
	$db = new PDO("mysql:host=".$dbsetting["host"].";dbname=".$dbsetting["name"].";chatset=utf8", $dbsetting["username"], $dbsetting["password"]);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $db;
}
?>