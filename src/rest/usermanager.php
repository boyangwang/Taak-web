<?php

class UserManager {

	private $db;

	public function __construct() {
		// Set up database connection
		$this->db = new PDO('mysql:host=localhost;dbname=deployas3;chatset=utf8', 'deployas3', 'deployas3');
		$this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	}

	public function deleteRecord($id) {
		// id is token since it has to be unique.
		// user is the userid
		$db = $this->db;
		$id = $db->quote($id);
		$query = "DELETE FROM user WHERE token=$id";
		$db->exec($query);
		return true;
	}

	public function addRecord($user, $id) {
		$db = $this->db;
		$id = $db->quote($id);
		$user = $db->quote($user);
		
		$query = "INSERT INTO user(id, realid, token) VALUES('null', $user, $id)";
		
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
		$query = "SELECT realid FROM user WHERE token='$token'";
		$result = $db->query($query);
		$entry = $result->fetch(PDO::FETCH_ASSOC);
		
		if ($entry != null) {
			// the token-user pair exists in our db, return the corresponding user
			return $entry['realid'];
		} else {
			// it's not in db
			// either first time token, or not valid
			// try to call fb api to check
			$token_ori = substr($token, 9);
			$fb_res_obj = null;
			$ch = curl_init();
			
			curl_setopt($ch, CURLOPT_URL, "https://graph.facebook.com/debug_token?input_token=" . $token_ori . "&access_token=472743636174429|b6cfb1f93ae4ee075cb05749da46f207");
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			
			$fb_res_obj = curl_exec($ch);
			
			curl_close($ch);
			$fb_res_obj = json_decode($fb_res_obj);
			
			
			if (isset($fb_res_obj) && isset($fb_res_obj->data) && isset($fb_res_obj->data->user_id) && isset($fb_res_obj->data->app_id)) {
				// it's a valid first time token. store the pair into db, and return the user
				$user_from_fb = $fb_res_obj->data->user_id . '_' . $fb_res_obj->data->app_id;
				
				$this->addRecord($user_from_fb, $token);
				
				return $user_from_fb;
			} else {
				// invalid
				return false;
			}
		}
	}

}

?>	