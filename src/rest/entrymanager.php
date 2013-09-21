<?php

class EntryManager {
	private $db;
	public function __construct() {
		// Set up database connection
		$this->db = new PDO('mysql:host=localhost;dbname=deployas3;chatset=utf8', 'deployas3', 'deployas3');
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}
	public function throwUnauthorized() {
		$result["code"] = 401;
		$result["message"] = "Not authorized";
		return $result;
	}
	// Batch modify
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
	// Modify an entry
	public function putEntry($user, $entry) {
		$db = $this->db;
		if (isset($entry['id'])) {
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
		} else {
			return false;
		}
	}
	// Batch delete
	public function deleteEntries($token, $entries) {
		$user = $token; // TODO: use actual user id
		foreach ($entries as $entry) {
			$this->deleteEntry($user, $entry["id"]);
		}
		$result["code"] = 200;
		$result["message"] = "success";
		return $result;
	}
	// Delete an entry
	public function deleteEntry($user, $id) {
		$db = $this->db;
		$user = $db->quote($user);
		$id = $db->quote($id);
		//$query = "DELETE FROM entries WHERE id=$id";
		// Use UPDATE to allow for synchronization after delete online on another device
		$query = "UPDATE entries SET value='' WHERE id=$id";
		$db->exec($query);
		return true;
	}
	// Get entries for this user
	public function getEntries($user) {
		$db = $this->db;
		$user = $db->quote($user);
		$query = "SELECT value FROM entries WHERE user=$user";
		$result = $db->query($query);
		return $result->fetchAll(PDO::FETCH_ASSOC);
	}
	// Get an entry
	public function getEntry($user, $id) {
		$db = $this->db;
		$user = $db->quote($user);
		$id = $db->quote($id);
		$query = "SELECT value FROM entries WHERE user=$user AND id=$id";
		$result = $db->query($query);
		$entry = $result->fetch(PDO::FETCH_ASSOC);
		if (!$this->verifyUser($user)) {
			$rawEntry = json_decode($entry["value"], true); // attempt to read meta-data from entry
			if ($rawEntry == null) {
				// Entry is not JSON
				return null;
			}
			if (isset($rawEntry["public"]) && $rawEntry["public"] == "true") {
				// Entry is public
				return $entry;
			} else {
				return null;
			}
		}
		return $entry;
	}
	// Process query from URL parameters for GET request
	public function handleGet($user) {
		if ($_GET['entryid'] == "") { // URL rewrite parameter
			if (!$this->verifyUser($user)) {
				echo json_encode($this->throwUnauthorized());
				return;
			}
			// User must be verified to view entire collection
			echo json_encode($this->getEntries($user));
		} else {
			echo json_encode($this->getEntry($user, $_GET['entryid']));
		}
	}
	// Process query from URL parameters for PUT request
	public function handlePut($user, $_PUT) {
		// User must be verified to perform modifications
		if (!$this->verifyUser($user)) {
			echo json_encode($this->throwUnauthorized());
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
		// User must be verified to perform deletion
		if (!$this->verifyUser($user)) {
			echo json_encode($this->throwUnauthorized());
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
	public function verifyUser($user) {
		//echo "TUSER: $user, USER: ".$_GET["userid"];
		if ($user == "") {
			return false;
		}
		return ($user == $_GET["userid"]);
	}
}

?>