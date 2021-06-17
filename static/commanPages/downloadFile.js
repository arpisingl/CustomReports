userid = "";
report_id = "";

$(document).ready(function(){
    // 
    url = window.location.href;
    urls = url.split("/")
    userid = urls[urls.length-2];
    report_id = urls[urls.length-1];
});


function download_data(){
	$.ajax({
		url : "/user/download-report/"+userid,
		data : {'report_id' : report_id},
		type: "application/json",
		method: "POST",
		success : function(res){
			  
            var fileNameCSV = res.report_title + ".csv";
            var fileNameEXCEL = res.report_title + ".xls";
            var jsonObject = res.report_content; 

            if(jsonObject.length > 0){
                for (var i = 0; i < jsonObject.length; i++) {
                    for (const key in jsonObject[i]) {
                        if(typeof jsonObject[i][key] === 'object')
                        {
                            var arr_key = '';
                            for (var akey = 0; akey < jsonObject[i][key].length; akey++) {
                                if (arr_key != ''){
                                    arr_key += '#';
                                }
                                arr_key += jsonObject[i][key][akey];
                            }
                            jsonObject[i][key] = arr_key;
                        }
                    }   
                }
                
                // // Convert JSON Into File Format

                // CSV File
                // download(fileNameCSV , ConvertToCSV(jsonObject));   

                // Excel File
                download(fileNameEXCEL , ConvertToExcel(jsonObject));
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


