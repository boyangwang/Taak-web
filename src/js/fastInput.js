
var fastInputs = {
	actions: [
		//Get/Give Information
		"Ask", "Tell", "Check", "Call", "Email",
		//Transport Things
		"Bring", "Take", "Buy", "Sell", "Download", "Upload",
		//Create Stuff
		"Write", "Code", "Make",
		//Receive Stuff
		"Watch", 
	],
	objects:[
		"groceries",
		"movies",
	],
};//Endof fastInputs



function searchFastInputs(query, process){
	;
}


$(function(){


	//should be #inputField. but wont change name in case break other stuff.
	$("#entryBox.typeahead").typeahead({
		local: fastInputs_ver1,
		// source: function(query, process){ /// https://www.google.com.sg/search?q=typeahead+dynamic+source&start=10	/// http://fusiongrokker.com/post/heavily-customizing-a-bootstrap-typeahead
		// 	alert("ok");
		// },
		// matcher: function() { return true; },
		// items: 7,
		// //window.fastInputs
	});
	//Temporary Hack Fix for typeahead screwing up existing CSS -> it creates some span and newly encloses your input field.
	///https://www.google.com.sg/search?q=twitter+typeahead+control+width
	$(".twitter-typeahead").css('width', "100%"); // cannot $(".typeahead").width() + "px" because the typeahead input is using 100% inherit from parent, and this DOM is the parent.
	$('.tt-hint').css('width', "99.5%"); //needs to be 99.5% or else will have some crap appearing on the right side.
	$('.tt-dropdown-menu').css('width', "100%");

});

var fastInputs_ver1 = [
	//Get/Give Information
	"Ask", "Tell", "Check", "Call", "Email",
	//Transport Things
	"Bring", "Take", "Buy", "Sell", "Download", "Upload",
	//Create Stuff
	"Write", "Code", "Make",
	//Receive Stuff
	"Watch", 
	"groceries",
	"movies",
];


