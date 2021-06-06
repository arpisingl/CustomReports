
fieldNames = [];
fieldTypes = [];
userid = "";
$(document).ready(function(){
	fieldNames = [];
	fieldTypes = [];
	url = window.location.href;
	urls = url.split("/")
	userid = urls[urls.length-1];
	// console.log(userid);
});


function saveReport(){
	
	var report_title = $("input[name = 'report_title']").val();
	var report_type = $("#report_type").val();

	if( report_title == ""){
		alert("Please add the title of this report");
	}
	else if( report_type == ""){
		alert("Please select the type of this report");
	}
	else{
		data = {
			"report_id" : Date.now(),
			"report_title" :report_title,
			"report_type" : report_type,
			"report_created_by" : userid,
			"report_created_on" : JSON.parse(JSON.stringify(new Date())),
			"report_fields_name" : fieldNames,
			"report_fields_type" : fieldTypes,
			"reprot_last_edit" : JSON.parse(JSON.stringify(new Date()))
		};

		// Ajax Request
		$.ajax({
			url: '/user/save-report/'+userid,
			type: 'POST',
			data: data,
			datatype: 'json',
			success: function(data){
				// console.log(data)

				alert(data['message']);

				fieldNames = [];
				fieldTypes = [];
				$("input[name = 'report_title']").val("");
				$("#report_type").val("");

				$("#field_part").html("Report Added Successfully");
				$("#field_part").css("display","block");
			}
		});
	}
	
	
}


function addField(){

	var report_fields_name = $("input[name = 'report_fields_name']").val();
	var report_fields_type = $("#report_fields_type").val();

	if(report_fields_name == "" || report_fields_type == ""){
		alert("Please Fill both the Fields")	
	}
	else{
		fieldNames.push(report_fields_name);
		fieldTypes.push(report_fields_type);
		
		// alert("Field Added Successfully");

		$("input[name = 'report_fields_name']").val("");
		$("#report_fields_type").val("");
		
		if(fieldNames.length > 0 && fieldTypes.length> 0){
			
			$("#field_part").append(
				// "<h3> Your report fields :</h3>"+
				"<div class='field-row row'>"+
					"<div class='field-name'>"+
						report_fields_name + "&nbsp;"+
						covertFieldTypeToMode(report_fields_type) + "&nbsp;"+
						"<span class='lnr lnr-cross-circle'></span>"+
					"</div>"+
				"</div>"
			);
			
			$("#field_part").css("display","block");

		}
		else{
			$("#field_part").html("No Field Added");
			$("#field_part").css("display","block");
		}


	}

}

function covertFieldTypeToMode(type){
	if(type == "text" ){
		return "| abc |"
	}
	else if(type == "number" ){
		return "| 123 |"
	}
	else if(type == "check_box" ){
		return "| <span class='lnr lnr-checkmark-circle'></span> |"
	}
	else if(type == "radio_button" ){
		return "| <span class='lnr lnr-circle-minus'></span> |"
	}
	else if(type == "text_area" ){
		return "| abc |"
	}
	else if(type == "date" ){
		return "| DD-MM-YY |"
	}
	else if(type == "image" ){
		return "| Image |"
	}
	else{
		return "| abc |"
	}
}


function remove_field(){
	// 
}

function search_report() {
	// body...
	var report_name = $("input[name = 'report_name']").val();

	var post_data = {
		'report_title' : report_name,
	}

	$.ajax({
		url : '/user/reports/'+userid+'/check-report',
		data : post_data,
		type : 'POST',
		dataType : 'json',
		success:  function(res){
			if(res.status === "False"){
				alert(res.message);
			}
			else{
				console.log(res);
				window.location.href = "/user/report/"+res.userid+"/"+res.report_id;
			}
		} 
	});
}