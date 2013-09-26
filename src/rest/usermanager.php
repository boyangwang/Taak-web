<?php
include_once("./rest/config.php");

class UserManager {
	private $db;

	public function __construct() {
		// Set up database connection
		$this->db = getDatabase();
	}

	// Delete token from database
	public function deleteRecord($token) {
		$db = $this->db;
		$token = $db->quote($token);
		$query = "DELETE FROM user WHERE token=$token";
		$db->exec($query);
		return true;
	}

	// Add token and id mapping
	public function addRecord($user, $token) {
		$db = $this->db;
		$token = $db->quote($token);
		$user = $db->quote($user);
		$refid = "ref_".uniqid();
		
		$query = "INSERT INTO user(id, realid, token) VALUES('$refid', $user, $token)";
		
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
		} else if (strpos($token, "token_") !== false) {
			// Backwards compatibility with old token
			return $this->getUserFromTokenAnon($token);
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
		$query = "SELECT realid FROM user WHERE token=$token";
		$result = $db->query($query);
		$entry = $result->fetch(PDO::FETCH_ASSOC);
		
		if ($entry != null) {
			// the token-user pair exists in our db, return the corresponding user
			return $entry['realid'];
		} else { // DEPRECATED
			// it's not in db
			// either first time token, or not valid
			// try to call fb api to check
			$token_ori = substr($token, 9);
			$fb_res_obj = null;
			$ch = curl_init();
			
			curl_setopt($ch, CURLOPT_URL, "https://graph.facebook.com/debug_token?input_token=" . $token_ori . "&access_token=472743636174429|b6cfb1f93ae4ee075cb05749da46f207");
			//curl_setopt($ch, CURLOPT_URL, "https://graph.facebook.com/debug_token?input_token=" . $token_ori . "&access_token=202826093232352|dcc1d2284ae9212869b99f405241052a");
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			
			$fb_res_obj = curl_exec($ch);
			
			//echo "TEST: $fb_res_obj,";
			
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