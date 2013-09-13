<?php
include_once "./oauth/library/OAuthStore.php";
include_once "./oauth/library/OAuthRequester.php";

class Auth {
	public static function authenticate($user, $password) {
		// Should check with db here
		// for now dummy
		$authPwd = Auth::getPwdByUsername($user);

		return true;
	}
	
	public static function getPwdByUsername($user) {
	
	}
}
?>