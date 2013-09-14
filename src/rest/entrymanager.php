<?php

class EntryManager {
	private $db;
	public function __construct() {
		$this->db = new PDO('mysql:host=localhost;dbname=deployas3;chatset=utf8', 'deployas3', 'deployas3');
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	public function putEntries($user, $entries) {
		$message = "";
		foreach ($entries as $entry) {
			$queryResult = $this->putEntry($user, $entry);
			if ($queryResult) {
				$message .= $entry["id"] . " is updated\n";
			}
		}
		$result["code"] = 200;
		$result["message"] = $message;
		return $result;
	}
	public function putEntry($user, $entry) {
		$db = $this->db;
		$id = $db->quote($entry['id']);
		$user = $db->quote($user);
		$value = $db->quote(json_encode($entry));
		$query = "INSERT INTO entries(id, user, value) VALUES($id, $user, $value) ON DUPLICATE KEY UPDATE id=$id, user=$user, value=$value;";
		$result = $db->exec($query);
		if ($result != null) {
			return true;
		} else {
			return false;
		}
	}
	public function deleteEntries($token, $entries) {
		$user = $token; // TODO: use actual user id
		foreach ($entries as $entry) {
			$this->deleteEntry($user, $entry["id"]);
		}
		$result["code"] = 200;
		$result["message"] = "success";
		return $result;
	}
	public function deleteEntry($user, $id) {
		$db = $this->db;
		$id = $db->quote($id);
		//$query = "DELETE FROM entries WHERE id=$id";
		// Use UPDATE to allow for synchronization after delete online on another device
		$query = "UPDATE entries SET value='' WHERE id=$id";
		$db->exec($query);
		return true;
	}
	// Get entris for this user
	public function getEntries($user) {
		$db = $this->db;
		$user = $db->quote($user);
		$query = "SELECT value FROM entries WHERE user=$user";
		$result = $db->query($query);
		return $result->fetchAll(PDO::FETCH_ASSOC);
	}
	public function handleGet($user) {
		if ($user == "") {
			return;
		}
		echo json_encode($this->getEntries($user));
	}
	// Process query from URL parameters for PUT request
	public function handlePut($user, $_PUT) {
		if ($user == "") {
			return;
		}
		if ($_GET['entryid'] == "") { // URL rewrite parameter
			// Batch transaction
			if (isset($_PUT['time']) && isset($_PUT['entries'])) {
				$result = $this->putEntries($user, $_PUT['entries']);
				$result['time'] = $_PUT['time'];
				echo json_encode($result);
			}
		} else {
			// Single entry
			if (isset($_PUT['time']) && isset($_PUT['entry'])) {
				$result = $this->putEntry($user, $_PUT['entry']);
				$result['time'] = $_PUT['time'];
				echo json_encode($result);
			}
		}
	}
	// Process query from URL parameters for DELETE request
	public function handleDelete($user, $_DELETE) {
		if ($user == "") {
			return;
		}
		if ($_GET['entryid'] == "") { // URL rewrite parameter
			// Batch transaction
			if (isset($_DELETE['time']) && isset($_DELETE['entries'])) {
				$result = $this->deleteEntries($user, $_DELETE['entries']);
				$result['time'] = $_DELETE['time'];
				echo json_encode($result);
			}
		} else {
			// Single entry
			if (isset($_DELETE['time'])) {
				$result = $this->deleteEntry($user, $_DELETE["entry"]);
				$result['time'] = $_DELETE['time'];
				echo json_encode($result);
			}
		}
	}
}

?>