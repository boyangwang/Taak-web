$("button[rel]").overlay();

$("#authSubmit").click(sendAuth);

function sendAuth(e) {
	var $username = $("#authForm input[name=username]");
	var $pwd = $("#authForm input[name=pwd]");

	if ($username.val() == "") {
		alert("Please input Username!");
	}
	$.ajax({
		type: 'POST',
		url: 'api:/auth/',
		headers: {'Authorization': 'Basic ' + window.btoa($username.val()+':'+CryptoJS.SHA1($pwd.val()))},
		success: function(response) {
			console.log(response);
		}
	});
	$username.val();
	$pwd.val();
}