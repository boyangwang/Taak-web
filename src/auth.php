<?php

//include_once "./oauth/library/OAuthStore.php";
//include_once "./oauth/library/OAuthRequester.php";

class AuthManager {

	static function translate_userid($token) {
		// if it's an anon_token, leave as it is
		if (strpos($token, "anon_token_") !== false) {
			return $token;
		} else if (strpos($token, "fb_token_") !== false) {
			return AuthManager::translate_fb_userid($token);
		}
		// unrecognized token
		else {
			return false;
		}
	}

	static function translate_fb_userid($token) {
		
		$token = substr($token, 8);
		$fb_res_obj = null;
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://graph.facebook.com/debug_token?input_token=" . $token . "&access_token=2f47db3bc610f17b66a7396562705616");
		$fb_res_obj = curl_exec($ch);
		curl_close($ch);

		if (isset($fb_res_obj) && isset($fb_res_obj['data']) && isset($fb_res_obj["user_id"]) && isset($fb_res_obj["app_id"])) {
			return $fb_res_obj['data']['user_id'].'_'.$fb_res_obj['data']['app_id'];
		}
		else {
			return false;
		}
	}

}

?>