var mode = "view"; //view || edit

$(document).ready(function(){
	$("#addButton").click(function(){
		addTask();
	});
	$("body").keyup(function(){
		$(".task").each(function(){
			if($($(this).children()[1]).is(':focus')){
				console.log($(this));
				var checkText = $($(this).children()[1]).html();
				if(checkText.indexOf('<br>')!=-1){
					console.log("here");
					$($(this).children()[1]).text($($(this).children()[1]).text().substring(0,$($(this).children()[1]).text().length-1))
					addTaskDetails($(this));
				}
			}
		});
	});
	$("#editButton").click(function(){
		if(mode == "view"){
			$(".task").each(function(){
				$(this).children().each(function(){
					if($(this).attr('class')=="taskText" || $(this).attr('class')=="taskContent"){
						$(this).attr('contenteditable','true');
					}
				});
			});
			$(".changeIcon").css("display","inline-block");
			mode = "edit";
		}
		else{
			$(".task").each(function(){
				$(this).children().each(function(){
					$(this).attr('contenteditable','false');
				});
			});
			$(".changeIcon").css("display","none");
			mode = "view";
		}
	});

	var headerHeight = parseInt($("#headerBar").css("height"));
	var headerWidth = parseInt($("#headerBar").css("width"));
	headerWidth = headerWidth/4*0.6/2;
	$(".topIcons").css("margin-top","-"+headerWidth+"px");
});

function addTaskDetails(section){
	var taskContent = $(document.createElement('div')).attr('class','taskContent');
	taskContent.attr('contenteditable','true');
	taskContent.text("this is test content");
	section.append(taskContent);
	taskContent.focusout(function(){
		$(this).attr('contenteditable','false');
		$(this).css("display","none");
	});
	taskContent.focus();
}

function addTask(){
	var task = $(document.createElement('div')).attr('class','task');
	var taskText = $(document.createElement('div')).attr('class','taskText');
	taskText.attr('contenteditable','true');

	var tickBox = $(document.createElement('div')).attr('class','tickBox');
	tickBox.html('&#10004;');
	tickBox.click(function(){
		console.log($(this).css("opacity"));
		if(parseFloat($(this).css("opacity"))==0.5){
			$(this).css("opacity","1.0");
		}
		else{
			$(this).css("opacity","0.5");
		}
	});
	task.append(tickBox);

	task.focusout(function(){
		if($($(this).children()[1]).text().length == 0){
			$(this).remove();
		}
		$(this).children().each(function(){
			if($(this).attr('class')=="tickBox"){
				$(this).css("display","inline");
			}
		});
		$($(this).children()[1]).attr('contenteditable','false');
	});
	task.click(function(){
		$(this).children().each(function(){
			if($(this).attr("class")=="taskContent"){
				if($(this).css("display")=="none"){
					$(this).css("display","block");
				}
				else{
					$(this).css("display","none");
				}
			}
		});
	});
	task.append(taskText);

	var dateLabel = $(document.createElement('div')).attr('class','dateLabel');
	var dayArray = new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
	var day = new Date();
	var dayText = dayArray[day.getDay()];
	dateLabel.text(dayText);
	task.append(dateLabel);
	/*
	
	*/
	var changeIcon = $(document.createElement('img')).attr('class','changeIcon');
	changeIcon.attr('src','images/changeIcon.png');
	task.append(changeIcon);

	$("#content").prepend(task);
	$(task.get(0)).children()[1].focus();
}