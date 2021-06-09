
userid = "";
$(document).ready(function(){
	// 
	url = window.location.href;
	urls = url.split("/")
	userid = urls[urls.length-2];
	report_id = urls[urls.length-1];

	getReportSize();
});

function search_report_on_report_page() {
	
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

function delete_report(){
	var confirm_del = confirm("Are you sure! You Are deleting this report with its data");

	if(confirm_del){
		
		var post_data = {
			'report_id' : report_id,
		}
		$.ajax({
			url : "/user/reports/"+userid+"/delete-report",
			data : post_data,
			type : 'POST',
			dataType : 'json',
			success:  function(res){
				if(res.status === "False"){
					alert(res.message);
				}
				else if(res.status === "OK"){
					alert(res.message);
					if(userid){
						window.location.href = "/user/view-reports/"+userid;	
					}
				}
			} 
		});

	}
}

function delete_report_data(){
	var confirm_del = confirm("Are you sure! You Are clearing the report Data");
	var post_data = {};

	if (confirm_del){

		if(report_id){
			post_data = {
				'report_id' : report_id,
			}
		}
		$.ajax({
			url : "/user/reports/"+userid+"/clear-report-data",
			data : post_data,
			type : 'POST',
			dataType : 'json',
			success:  function(res){
				if(res.status === "False"){
					alert(res.message);
				}
				else if(res.status === "OK"){
					alert(res.message);
					if(userid){
						window.location.href = "/user/report/"+userid+"/"+report_id;
					}
				}
			} 
		});
	}
}

// 
function getReportSize(){
	
	var post_data = {};

	if(report_id){
		post_data = {
			'report_id' : report_id,
		}
	}
	$.ajax({
		url : "/user/reports/"+userid+"/report-size",
		data : post_data,
		type : 'POST',
		dataType : 'json',
		success:  function(res){
			if(res.status === "False"){
				alert(res.message);
			}
			else{
				for (var i = 0; i < res.length; i++) {
					if(res[i]._id === report_id){
						$("#report_size").html("Report Size : "+res[0].count);
					}
				}
			}
		} 
	});
}