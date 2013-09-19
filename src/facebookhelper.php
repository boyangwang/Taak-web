<?php
include("config.php");
@include("localconfig.php"); // overrides for local testing

// Processing signed Facebook requests
function process_request($request) {
	global $config;
	$secret = $config["secret"];
	list($encoded_signature, $payload) = explode(".", $request, 2); 
	// Decode request
	$signature = base64_url_decode($encoded_signature);
	$data = json_decode(base64_url_decode($payload), true);
	if (strtoupper($data["algorithm"]) !== "HMAC-SHA256") {
		return null; // Unknown algorithm used
	}
	// Check signature
	$expected_sig = hash_hmac("sha256", $payload, $secret, true);
	if ($signature !== $expected_sig) {
		return null; // Bad signature
	}
	return $data;
}

// decode base64 url
function base64_url_decode($input) {
	return base64_decode(strtr($input, '-_,', '+/='));
}

// Getting token from code (authentication handshake)
function getAccessTokenDetails($code)
{
	global $config;
	$app_id = $config["appId"];
	$app_secret = $config["secret"];
	$app_redirect = $config["redirect"];
	
	$token_url = "https://graph.facebook.com/oauth/access_token?client_id=".$app_id."&redirect_uri=".$app_redirect."&client_secret=".$app_secret."&code=".$code;
	$response = performRequest($token_url);

	$params = null;
	parse_str($response, $params); //parse name value pair
	return $params;
}

function performRequest($uri) {
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $uri);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2); 
	$result = curl_exec($ch);
	curl_close($ch);
	return $result;
}
?>