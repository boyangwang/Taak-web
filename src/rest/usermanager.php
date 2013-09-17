<?php

class UserManager {

	private $db;

	public function __construct() {
		// Set up database connection
		$this->db = new PDO('mysql:host=localhost;dbname=deployas3;chatset=utf8', 'deployas3', 'deployas3');
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}

	public function deleteRecord($user, $id) {
		// id is token since it has to be unique.
		// user is the userid
		$db = $this->db;
		$user = $db->quote($user);
		$id = $db->quote($id);
		$query = "DELETE FROM user WHERE id=$id";
		$db->exec($query);
		return true;
	}

	public function addRecord($user, $id) {
		$db = $this->db;
		$id = $db->quote($entry['id']);
		$user = $db->quote($user);
		$value = $db->quote(json_encode($entry));
		$query = "INSERT INTO user(id, user, value) VALUES($id, $user, null)";
		$result = $db->exec($query);
		if ($result != null) {
			return true;
		} else {
			return false;
		}
	}

	// Get an entry
	public function getUserFromTokenAll($token) {
		// if it's an anon_token, leave as it is
		if (strpos($token, "anon_token_") !== false) {
			return $this->getUserFromTokenAnon($token);
		} else if (strpos($token, "fb_token_") !== false) {
			return $this->getUserFromTokenFB($token);
		}
		// unrecognized token
		else {
			return false;
		}
	}

	public function getUserFromTokenAnon($token) {
		return $token;
	}

	public function getUserFromTokenFB($token) {
		$db = $this->db;
		$token = $db->quote($token);
		
		$query = "SELECT user FROM user WHERE id=$token";
		$result = $db->query($query);
		return print_r(PDO::errorInfo(), 1);
//		return "db all done";
		$entry = $result->fetch(PDO::FETCH_ASSOC);
//		return "db all done";
		
		if ($entry != null) {
			// the token-user pair exists in our db, return the corresponding user
			return $entry['user'];
		} else {
			// it's not in db
			// either first time token, or not valid
			// try to call fb api to check
			$token = substr($token, 8);
			$fb_res_obj = null;
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, "https://graph.facebook.com/debug_token?input_token=" . $token . "&access_token=2f47db3bc610f17b66a7396562705616");
			$fb_res_obj = curl_exec($ch);
			curl_close($ch);
			if (isset($fb_res_obj) && isset($fb_res_obj['data']) && isset($fb_res_obj["user_id"]) && isset($fb_res_obj["app_id"])) {
				// it's a valid first time token. store the pair into db, and return the user
				$user_from_fb = $fb_res_obj['data']['user_id'] . '_' . $fb_res_obj['data']['app_id'];
				
				$this->addRecord($token, $user_from_fb);
				
				return $user_from_fb;
			} else {
				// invalid
				return false;
			}
		}
	}

}

?>	