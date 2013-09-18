//$("button[rel]").overlay();

//$("#authSubmit").click(sendAuth);

function sendAuth(e) {
	var $username = $("#authForm input[name=username]");
	var $pwd = $("#authForm input[name=pwd]");

	if ($username.val() == "") {
		alert("Please input Username!");
	}
	$.ajax({
		type: 'POST',
		url: 'api/',
		data: "action=auth",
		headers: {'Authorization': 'Basic ' + window.btoa($username.val()+':'+CryptoJS.SHA1($pwd.val()))},
		success: function(response) {
			if (response == true) {
				var loginBtn = $('.loginBtn').eq(0)
				//loginBtn.html('Logout');
				
				loginBtn.off('click').click(logout);
				var authOverlay = $('#authOverlay');
				$('.close', authOverlay).click();
			}
			else {
				alert("Credential wrong! Please check");
			}
		}
	});
	$username.val();
	$pwd.val();
}

function logout(e) {
	
}
