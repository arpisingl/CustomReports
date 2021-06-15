
fieldNames = [];
fieldTypes = [];
checkboxLabels = [];
radioLabels = [];
selectLabels = [];
userid = "";
var label_data = {};
var data = {};

$(document).ready(function(){
	fieldNames = [];
	fieldTypes = [];
	checkboxLabels = [];
	radioLabels = [];
	selectLabels = [];
	data = {};
	label_data = {};

	url = window.location.href;
	urls = url.split("/")
	userid = urls[urls.length-1];
	console.log(userid);


	$("#report_fields_type").change(function(){
		var selectedType= $("#report_fields_type").val();
		
		if(selectedType === "radio" || selectedType === "checkbox" || selectedType === "select"){
			$(".add-but").css("display","none");
			$(".label-input").css("display","block");
		}
		else{
			$(".add-but").css("display","block");
			$(".label-input").css("display","none");
		}

	})
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
		if(label_data){

			data["report_id"] = Date.now();
			data["report_title"] = report_title;
			data["report_type"] = report_type;
			data["report_created_by"] = userid;
			data["report_created_on"] = JSON.parse(JSON.stringify(new Date()));
			data["report_fields_name"] = fieldNames;
			data["report_fields_type"] = fieldTypes;
			data["reprot_last_edit"] = JSON.parse(JSON.stringify(new Date()));
			data['labels'] = label_data;
		}
		
		// Ajax Request
		$.ajax({
			url: '/user/save-report/'+userid,
			type: 'POST',
			data: data,
			datatype: 'application/json',
			success: function(res){
				alert(res['message']);

				fieldNames = [];
				fieldTypes = [];
				checkboxLabels = [];
				radioLabels = [];
				selectLabels = [];
				data = {};
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
		$("input[name = 'report_fields_name']").val("");
		$("#report_fields_type").val("");
		radioLabels = [];
		checkboxLabels = [];
		selectLabels = [];
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
			$(".label-input").css("display","none");
		}
		else{
			$("#field_part").html("No Field Added");
			$("#field_part").css("display","block");
		}
	}

}

function addFieldWithLabel(){

	var report_fields_name = $("input[name = 'report_fields_name']").val();
	var report_fields_type = $("#report_fields_type").val();
	var report_fields_label = $("input[name = 'report_fields_label']").val();

	if(report_fields_name === "" || report_fields_type === "" || report_fields_label === ""){
		alert("Please Fill all the Fields")	
	}
	else{
		
		if(report_fields_type === "radio"){
			radioLabels.push(report_fields_label);
			label_data[report_fields_name] = radioLabels;
			
		}
		else if(report_fields_type === "checkbox"){
			checkboxLabels.push(report_fields_label);
			label_data[report_fields_name] = checkboxLabels;
			
		}
		else if(report_fields_type === "select"){
			selectLabels.push(report_fields_label);
			label_data[report_fields_name] = selectLabels;
			
		}
		else{

		}
		$("input[name = 'report_fields_label']").val("");
	}

}

function covertFieldTypeToMode(type){
	if(type == "text" ){
		return "| abc |"
	}
	else if(type == "number" ){
		return "| 123 |"
	}
	else if(type == "checkbox" ){
		return "| <span class='lnr lnr-checkmark-circle'></span> |"
	}
	else if(type == "radio" ){
		return "| <span class='lnr lnr-circle-minus'></span> |"
	}
	else if(type == "textarea" ){
		return "| abc |"
	}
	else if(type == "date" ){
		return "| DD-MM-YY |"
	}
	else if(type == "img" ){
		return "| Image |"
	}
	else if(type == "select" ){
		return "| Select |"
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

function download_data_by(r_id){

    $.ajax({
        url : "/user/download-report/"+userid,
        data : {'report_id' : r_id},
        type: "application/json",
        method: "POST",
        success : function(res){
            var fileName = res.report_title + ".xls";
            var jsonObject = res.report_content; 

            if(jsonObject.length > 0){
            	for (var i = 0; i < jsonObject.length; i++) {
	                for (const key in jsonObject[i]) {
	                    if(typeof jsonObject[i][key] === 'object')
	                    {
	                        var arr_key = '';
	                        for (var akey = 0; akey < jsonObject[i][key].length; akey++) {
	                            if (arr_key != ''){
	                                arr_key += ',';
	                            }
	                            arr_key += jsonObject[i][key][akey];
	                        }
	                        jsonObject[i][key] = arr_key;
	                    }
	                }   
	            }
	            
	            // // Convert JSON Into Excel Format
	            // // download data here
	            download(fileName , ConvertToExcel(jsonObject));
            }
            else{
            	alert("No Data Available");
            }
        }
    });
}

function download(filename, textInput) {

	var element = document.createElement('a');
	element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
	element.setAttribute('download', filename);
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

// JSON to CSV Converter
function ConvertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var header = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        header = '';
        
        for (var index in array[i]) {
            if (line != ''){
            	line += ',';
            	header += ',';
            }
            header += index;
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return header + '\r\n' + str;
}

function ConvertToExcel(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var header = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        header = '';
        for (var index in array[i]) {
            if (line != ''){
            	line += '\t';
            	header += '\t';
            }
            header += index;
            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return header + '\r\n' + str;
}