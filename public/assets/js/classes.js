$(function() {
	function populateModal(AvailableClasses){
		for (var i=0;i<AvailableClasses.length;i++){
			//console.log("im here 333");
			var classAvailable=AvailableClasses[i].classname;
			var classid=AvailableClasses[i].id;
			var classname=AvailableClasses[i].classname;
			var classdesc=AvailableClasses[i].classdesc;
			var datas="data-classid="+classid+" data-classname="+classname+" data-classdesc="+classdesc;
			var className="<div class='availableClass'data-classID="+classid+">"+classAvailable+"<div>"
			var enrollebtn="<button "+datas+" class='Enroll'>Enroll</button>"
			$("#classesAvailableModalbody").append(className+enrollebtn);
		}
	};
	//POPULATE CLASSES AVAILABLE 
	$("#seeAvailclassesBtn").on("click",function(event){
		//console.log("see avail clicked");
		var userInfo = window.location.pathname.substr(1,window.location.pathname.length);
		userInfo = userInfo.substr(userInfo.indexOf("/")+1, userInfo.length);
		var userName = userInfo.substr(0, userInfo.indexOf("/"));
		
		$("#classesAvailableModalbody").empty();
		
		$.get("/api/classes").then(function(allClasses){
			var AvailableClasses=[];
			var teachersnotuser=[];
			//finds where teacheruserna is not equal username then pushes into an array the class info, and the students
			for(var i=0;i<allClasses.length;i++){
				var teacher=allClasses[i].Teacher.username;
				if(teacher !== userName ){
					//console.log(teacher);
					var classes={
						id:allClasses[i].id,
						classname:allClasses[i].classname,
						Students:allClasses[i].Students
					}
					teachersnotuser.push(classes);
				}
			}
			//now we take the array with the classes and check if studentsusername is not equal to username then we push into array
			for (var j=0;j<teachersnotuser.length;j++){
				var studentLength=teachersnotuser[j].Students.length;

				for(var k=0;k<teachersnotuser[j].Students.length;k++){
					var student= teachersnotuser[j].Students[k].username;
					if(student!==userName){
						AvailableClasses.push(teachersnotuser[j]);
					}
				}
			}
			//console.log("classeLength: "+AvailableClasses.length);
			//we send the array with the available classes to a function to populate our modal
			populateModal(AvailableClasses);
			$("#classesAvailableModal").modal("show");
			
		});
		
	});
	
	//enrolling in class button
	//we need to use event delegation since our buttons do not exist when our document loads
	$("#classesAvailableModalbody").on("click",".Enroll" ,function(event){
	//$(".Enroll").on("click", function(event){
		console.log("enrolled is being clicked");
		var classid = $(this).attr("data-classid");
		//Look through the current class information
		$.get("/api/classes/"+classid).then(function(response){
			var classname = response.classname;
			var classdesc = response.classdesc;
			var userInfo = window.location.pathname.substr(1,window.location.pathname.length);
			userInfo = userInfo.substr(userInfo.indexOf("/")+1, userInfo.length);
			if ( userInfo.indexOf("/") !== -1)
			{
				var userName = userInfo.substr(0, userInfo.indexOf("/"));
			}
			else {
				userName = userInfo;
			}
			//Look at current user's information
			$.get("/api/users/"+userName).then(function(uResponse){
				var userID = uResponse.id;
				var nameOfUser = uResponse.name;
				//look to see if user already exists as students
				$.get("/api/students/"+userName).then(function(sResponse){
					//If user is not yet a student, make them a student
					if(sResponse === null)
					{
						$.ajax("/api/students", {
							type: "POST",
							data: {
								username: userName,
								name: nameOfUser,
								MadeClassId: classid
							}
						}).then(
						function(createdSResponse) {
							console.log("student has been created");
							$.get("/api/students/"+userName).then(function(studentsResponseWithNew){
								if(studentsResponseWithNew){
									var studentID = studentsResponseWithNew.id;
									var newClass = {
										classname: classname,
										classdesc: classdesc,
										UserId: userID,
										StudentId: studentID
									}
								$.ajax("/api/enrollment", {
									type: "POST",
									data: newClass
									}).then(
									function(createdEResponse) {
										console.log("enrollment has been createdif");
										location.reload();
									})
								}
							});
						})
					}
					//If it already exists, read the information
					else
					{
						var studentID = sResponse.id;

						var newEnrolled = {
							classname: classname,
							classdesc: classdesc,
							UserId: userID,
							StudentId: studentID
						}


						$.ajax("/api/enrollment", {
							type: "POST",
							data: newEnrolled
						}).then(
						function() {
							console.log("enrollment has been created else");
							location.reload();
						})

					}
				});
			})
		});
		// var newStudent={
		// 	username:userName,
		// 	name:studentName
		// }	
	});
	//view class page button clicked
	$(".classPg").on("click", function(event)
	{
		var userInfo = window.location.pathname.substr(1,window.location.pathname.length);
		userInfo = userInfo.substr(userInfo.indexOf("/")+1, userInfo.length);
		var userName = userInfo.substr(0, userInfo.indexOf("/"));
		var classid=$(this).attr("data-classid");
		$.get("/api/classes/"+classid).then(function(response){
			var teachername = response.Teacher.username;
			if (userName===teachername){
						window.location="/classTeacherview/"+userName+"/";
			}
			else{
				//change window location without goback 
						//window.location.replace("/classes/"+username+"/"+name);
						//allows go back
						window.location="/classStudentview/"+userName+"/";
			}
		})
	})

	//creating new class button
	$("#create-new-class").on("click", function(even)
	{
		event.preventDefault();
		var className = $("#new-class-name").val().trim();
		var classDesc = $("#new-class-desc").val().trim();
		var userInfo = window.location.pathname.substr(1,window.location.pathname.length);
		userInfo = userInfo.substr(userInfo.indexOf("/")+1, userInfo.length);
		if ( userInfo.indexOf("/") !== -1)
		{
			var userName = userInfo.substr(0, userInfo.indexOf("/"));
		}
		else {
			userName = userInfo;
		}
		if(className && classDesc)
		{
			$.get("/api/users/"+userName).then(function(response){
				if(response){
					var userID = response.id;
					var nameOfUser = response.name;
					$.get("/api/teachers/"+userName).then(function(tResponse){
						if(tResponse === null)
						{
							$.ajax("/api/teachers", {
								type: "POST",
								data: {
									username: userName,
									name: nameOfUser
								}
							}).then(
							function() {
								console.log("teacher has been created");
								$.get("/api/teachers/"+userName).then(function(response){
									if(response){
										var teacherID = response.id;
										var newClass = {
											classname: className,
											classdesc: classDesc,
											UserId: userID,
											TeacherId: teacherID
										}
										$.ajax("/api/classes", {
											type: "POST",
											data: newClass
										}).then(
										function() {
											console.log("class has been created");
											location.reload();
										})
									}
								});
							})
						}
						else
						{
							$.get("/api/teachers/"+userName).then(function(response){
								if(response){
									var teacherID = response.id;
									var newClass = {
										classname: className,
										classdesc: classDesc,
										UserId: userID,
										TeacherId: teacherID
									}
									$.ajax("/api/classes", {
										type: "POST",
										data: newClass
									}).then(
									function() {
										console.log("class has been created");
										location.reload();
									})
								}
							});
						}
					});
				}
			});
		}
	});
});