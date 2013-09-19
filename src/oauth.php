<?php
include("facebookhelper.php");
include("rest/usermanager.php");

$param = getAccessTokenDetails($_REQUEST["code"]);
if (isset($param["access_token"])) {
	$uservarsjson = performRequest("https://graph.facebook.com/me?access_token=".$param["access_token"]);
	$uservars = json_decode($uservarsjson, true);
	$fb_token = $param["access_token"];
	$fb_userid = $uservars["id"];

	if (isset($uservars)) {
		$manager = new UserManager();
		$manager->addRecord($fb_token, $fb_userid);
	} else {
		echo "Access token invalid";
	}
} else {
	echo "Authentication failure";
}

if (isset($fb_token) && isset($fb_userid)) {
?>
<!DOCTYPE html>
<html>
	<head>
		<script>
			var fb_token = "<?php echo $fb_token; ?>";
			var fb_userid = "<?php echo $fb_userid; ?>";
			localStorage.fb_token = "fb_token_" + fb_token;
			localStorage.fb_metadata = fb_token; // for debugging
			localStorage.fb_userid = fb_userid;
			window.location = "./";
		</script>
	</head>
</html>
<?php } ?>