
// return from ajax:
return_email_from_ajax = null;
return_userid_from_ajax = null;

// on document load :
$(document).ready(function(){
	return_email_from_ajax = null;
	return_userid_from_ajax = null;
});

function registerUser(){

	var username = $("input[name = 'username']").val();
	var email = $("input[name = 'email']").val();
	var password = $("input[name = 'password']").val();
	var cPassword = $("input[name = 'cPassword']").val();

	if(password.length>1 && username.length>4 && email.length>1 ){

		userid = validate_userid(username);
		password = validate_password(password,cPassword);
		email = validate_email(email);
		
		register_data = {
			'username': userid,
			'password': password,
			'email': email,
			'cPassword' : cPassword
		};		

		if(userid && password && email ){
			$('.valid_box_userid').css("display","none");
			$('.valid_box_password').css("display","none");
			$('.valid_box_email').css("display","none");

			check_existing_userid(userid);
			check_existing_email(email);
			
			setTimeout(()=>{
				if(return_email_from_ajax && return_userid_from_ajax ){

					if(userid === return_userid_from_ajax && email === return_email_from_ajax){

						return_email_from_ajax = null;
						return_userid_from_ajax = null;
						
						$.ajax({
							url: '/signup/add-user',
							type: 'POST',
							data: register_data,
							datatype: 'json',
							success: function(data){
								
								alert("Account Created Successfully");

								$('.success_section').css("display","block");
								$('.success_section').html(data['message']);

								$("input[name = 'username']").val("");
								$("input[name = 'email']").val("");
								$("input[name = 'password']").val("");
								$("input[name = 'cPassword']").val("");
							}
						});	
					}
				}
			},1500);			
			
		}
		else if(!userid){
			alert("Invalid Userid");
		}
		else if(!password){
			alert("Invalid Password");
		}
		else if(!email){
			alert("Invalid Email");
		}
		else{
			alert("Invalid Data");
		}
	}
	else{
		alert("Please fill all fields");
	}
	


}


function validate_userid(userid){
	userid_pattrn = /[-_a-z0-9]/g;
	spclChar_pattern = /[@#$%^&*()+=!`~<>,.?/":;{ ]/g;

	if(userid.match(userid_pattrn)){
		if( !userid.match(spclChar_pattern) ){
			$('.valid_box_userid').css("display","none");
			return userid;	
		}
		else{
			$('.valid_box_userid').css("display","block");
		}
	}
	else{
		$('.valid_box_userid').css("display","block");
		return null;
	}
}

function validate_password(password, cPassword){
	if(password === cPassword){
		if(password.length < 5 ){
			$(".pass_error_mess").html("Password Too Short");
			$('.valid_box_password').css("display","block");
			return null;
		}
		else{
			$('.valid_box_password').css("display","none");
			return password;
		}
	}
	else{
		$(".pass_error_mess").html("Password Are Not Matching");
		$('.valid_box_password').css("display","block");
		return null;
	}
	
}

function validate_email(email){
	atRate_pattern = /[@]/g;
	dot_pattern = /\.[a-z]/g;
	word_pattern = /\w/g;

	if(email.match(word_pattern)){
		if(email.match(atRate_pattern)){
			if(email.match(dot_pattern)){
				if(finalize_email(email)){
					$('.valid_box_email').css("display","none");
					return email;
				}
				else{
					$('.valid_box_email').css("display","block");
					$(".email_error_mess").html("This is not a valid email");
				}
			}else{
				$('.valid_box_email').css("display","block");
				$(".email_error_mess").html("This is not a valid email");
			}
		}
		else{
			$('.valid_box_email').css("display","block");
			$(".email_error_mess").html("This is not a valid email");
		}
	}
	else{
		$('.valid_box_email').css("display","block");
		return null;
	}
}

function finalize_email(email){
	atRate_cnt = 0;
	dot_cnt = 0;
	space_cnt = 0;
	for (var i = 0; i < email.length; i++) {
		if(email[i] === '@'){
			atRate_cnt = atRate_cnt + 1;
		}
		else if(email[i] === '.'){
			dot_cnt = dot_cnt + 1;
		}
		else if(email[i] === ' '){
			space_cnt = space_cnt + 1;
		}
	}
	if (atRate_cnt > 1){
		return null;
	}
	else if(space_cnt > 0){
		return null;
	}
	else if(dot_cnt > 3){
		return null;
	}
	else if(email[email.length-1] === '@' || email[email.length-1] === '.'){
		return null;
	}
	else if(email[0] === '@' || email[0] === '.'){
		return null;
	}
	else{
		return email;
	}
}


function check_existing_userid(userid){
	// check the userid if not exist return False.. 
	// else True..
	$.ajax({
		url : "/check-existing-userid",
		data : { 'username' : userid},
		datatype : 'application/json',
		type : "POST",
		success : function(res){
			if(res.status === "False"){
				$(".username_error_mess").html("Userid Already Exist !");
				$('.valid_box_userid').css("display","block");
				return_email_from_ajax = null;
			}
			else if (res.status === "True"){
				$('.valid_box_userid').css("display","none");
				return_userid_from_ajax =  userid;
			}
		}
	});
}

function check_existing_email(email){
	// check the email if not exist return False.. 
	// else True..
	$.ajax({
		url : "/check-existing-email",
		data : { 'email' : email},
		datatype : 'application/json',
		type : "POST",
		success : function(res){
			if(res.status === "False"){
				$(".email_error_mess").html("Email Already Exist !");
				$('.valid_box_email').css("display","block");
				return_email_from_ajax = null;
			}
			else if (res.status === "True"){
				$('.valid_box_email').css("display","none");
				return_email_from_ajax = email;
			}
		}
	});
}

