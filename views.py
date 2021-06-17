from flask import Flask, redirect, url_for, request, render_template, session, flash

from flask_pymongo import PyMongo
from pprint import pprint
from bson.json_util import dumps
from models import User as user
from models import Reports as report_model
from models import ReportData as rd_model
from datetime import datetime as dt
from datetime import date

app = Flask(__name__)

# app.config["MONGO_URI"] = "mongodb://localhost:27017/Flask"
app.config["MONGO_URI"] = "mongodb+srv://arpitMongo:!YNsbW7!ibqBcZ4@cluster0.vznht.mongodb.net/Flask?retryWrites=true&w=majority"
app.secret_key = "mysecret_key4@1234"
mongo = PyMongo(app)

# View Pages

# Index Pages
@app.route("/")
def root():
	return render_template('index.html')

# Register Page
@app.route("/signup")
def signup():
	return render_template('Register.html')

# Forgot Page
@app.route("/forgot-password")
def forgot_password():
	return render_template('ForgotPas.html')

# Reset Password Page
@app.route("/reset-password/<id>")
def reset_password(id):
	return render_template("ResetPass.html",id=id)

# Login Page
@app.route("/user/home/<id>")
def load_user_home(id):
	userData = user.find_by_userid(mongo,id)
	reportData = report_model.find_recent_reports(mongo,id)

	reports = []

	for report in reportData:
		reports.append(report)

	# all_user_reports = dumps(reports)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			return render_template("UserHome.html", data = userData, report_data = reports)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)		

	
# Logout Page
@app.route("/logout/<id>")
def logout(id):
	if(id == session['userid']):
		session.pop('userid',None)
		return redirect(url_for('root'))
	else:
		response = {
			'status' : "False",
			'message' : "Incorrect UserId"
		}
		return render_template("index.html", response = response)	

# Create New Report Page
@app.route("/user/create-report/<id>")
def load_create_report(id):
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			return render_template("CreateReport.html", data = userData)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)		
 

# View All Reports Page
@app.route("/user/view-reports/<id>")
def load_view_reports(id):
	userData = user.find_by_userid(mongo,id)
	recent_reportData = report_model.find_recent_reports(mongo,id)
	reportData = report_model.fetch_all_reports(mongo,id)

	recent_reports = []
	all_reports = []

	for recent_report in recent_reportData:
		recent_reports.append(recent_report)

	for report_ in reportData:
		all_reports.append(report_)

	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			return render_template("ViewAllReports.html", data = userData, report_data = recent_reports, user_reports = all_reports)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)		


# view user report:
@app.route("/user/report/<id>/<report_id>")
def load_user_report(id,report_id):
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			
			reportData = report_model.find_by_report_id(mongo,id,report_id)
			if(reportData):
				report_cols = []
				colTypes = reportData['report_fields_type']

				for (a, b) in zip(reportData['report_fields_name'], colTypes):
					report_col = {
						'report_fields_name' : a.replace(" ","_").replace(".",""),
						'report_fields_type' : b
					}
					report_cols.append(report_col)
				# return dumps(report_cols)
				return render_template("ViewReport.html", data = userData, report_content = reportData, report_cols = report_cols)
			else:
				return render_template("ViewReport.html", data = userData)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)
	
# User Report Data Content
@app.route("/user/report-data/<id>/<report_id>")
def load_report_data(id,report_id):
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			
			reportData = report_model.find_by_report_id(mongo,id,report_id)
			if(reportData):
			
				report_data_list = []
				report_content_data = rd_model.getAllDataById(mongo,id,report_id)
				for row in report_content_data:
					report_data_list.append(row)


				# return dumps(report_content_data)
				if(report_content_data):
					return render_template("ViewReportData.html", data = userData, report_content = reportData, ReportData = report_data_list)		
			
			else:
				return render_template("ViewReportData.html", data = userData)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)



# Model Pages...

# calculate the report_size
@app.route("/user/reports/<id>/report-size", methods=['POST'])
def get_report_size(id):
	report_id = request.form['report_id']
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			report_data_content = rd_model.get_report_size(mongo,report_id,id)
			if(report_data_content):
				return dumps(report_data_content)
			else:
				res = {
					'status': 'False',
					'message' : "No Report Found" 
				}
				return res
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)	


# search report by title:
@app.route("/user/reports/<id>/check-report", methods=['POST'])
def searchReport(id):
	report_title = request.form['report_title']

	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			report_content = report_model.find_report_by_title(mongo,report_title,id)

			if(report_content):
				res_data = {
					'report_id' : report_content['report_id'],
					'userid' : report_content['report_created_by']
				}
				return res_data
			else:
				res = {
					'status': 'False',
					'message' : "No Report Found" 
				}
				return res
			
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)		

# delete Report permanently : 
@app.route("/user/reports/<id>/delete-report", methods=['POST'])
def delete_report(id):
	report_id = request.form['report_id']

	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			report_data_content = rd_model.delete_report_data(mongo,report_id,id)
			if(report_data_content):
				report_content = report_model.delete_report(mongo,report_id,id)
				if(report_content):
					current_report_count = userData['no_of_report_created']
					current_report_count = current_report_count - 1
					updated_report_count = user.updateReportCount(mongo,userData['username'],current_report_count)
					res_data = {
						'status':  'OK',
						'message' : "Report Deleted Successfully"
					}
					return res_data
				else:
					res = {
						'status': 'False',
						'message' : "No Report Found" 
					}
					return res
			
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)	

# clear report data:
@app.route("/user/reports/<id>/clear-report-data", methods=["POST"])
def delete_report_data(id):
	now = dt.now()
	report_id = request.form['report_id']
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			report_data_content = rd_model.delete_report_data(mongo,report_id,id)
			if(report_data_content):
				# update report_last edit
				report_last_edit = now.strftime("%d/%m/%Y %H:%M:%S")
				reportData = report_model.update_report_last_edit(mongo,id,report_id,report_last_edit)

				res_data = {
					'status':  'OK',
					'message' : "Report Cleared Successfully"
				}
				return res_data
			else:
				res = {
					'status': 'False',
					'message' : "No Report Found" 
				}
				return res
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)	

# Delete document from a ReportData
@app.route("/user/report-data/<id>/<report_id>/<report_data_id>/delete")
def delete_report_row(id,report_id,report_data_id):
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			reportData = report_model.find_by_report_id(mongo,id,report_id)
			if(reportData):
				# delete the current row:
				deleted_row = rd_model.deleteByReportDataID(mongo,id,report_id,report_data_id)

				if deleted_row:
					report_data_list = []
					report_content_data = rd_model.getAllDataById(mongo,id,report_id)
					for row in report_content_data:
						report_data_list.append(row)

					if(report_content_data):
						return render_template("ViewReportData.html", data = userData, report_content = reportData, ReportData = report_data_list)
			else:
				return render_template("ViewReportData.html", data = userData)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)

#check_Exsiting_User : 
@app.route("/check-existing-userid", methods=['POST'])
def check_existing_userid():
	username = request.form['username']
	extUser = user.checkExistingUserid(mongo,username)
	if(extUser):
		response = {
			'status' : "False",
			'message' : "User Exist"
		}
		return response
	else:
		response = {
			'status' : "True",
			'message' : "User Not Exist"
		}
		return response

#check_Exsiting_Email : 
@app.route("/check-existing-email", methods=['POST'])
def check_existing_email():
	email = request.form['email']
	extMail = user.checkExistingEmail(mongo,email)
	if(extMail):
		response = {
			'status' : "False",
			'message' : "Email Exist"
		}
		return response
	else:
		response = {
			'status' : "True",
			'message' : "Email Not Exist"
		}
		return response

# check the Login details by the User
@app.route("/login/check-user", methods=['POST'])
def check_user():

	username = request.form['username']
	password = request.form['password']

	User_data = {
		'username' : username,
		'password' : password
	}

	existedUser = user.find_user(mongo,User_data)

	if(existedUser):
		session['userid'] = existedUser['username']
		return redirect('/user/home/'+existedUser['username'])
	else:
		response_ob = {
			'status' : "False",
			'message' : "Incorrect Userid or Password"
		}
		return render_template('index.html', response=response_ob)

	
# Register Page Handler
@app.route("/signup/add-user", methods=['POST'])
def add_user():	
	
	now = dt.now()
	current_date = now.strftime("%d/%m/%Y %H:%M:%S")
	
	username = request.form['username']
	email = request.form['email']
	password = request.form['password']
	c_password = request.form['cPassword']

	if(password == c_password):
		User_data = {
			'username' : username,
			'email' : email,
			'password' : password,
			'no_of_report_created' : 0,
			'account_created_on' : dt.strptime(current_date, "%d/%m/%Y %H:%M:%S")
		}
		newUser = user.add_user(mongo,User_data)
		response = {
			'status' : "Ok",
			'message' : "Account Created"
		}
		return response
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Data Passwords Are Matching"
		}
		return render_template('Register.html', response=response)
	
# Forgot Password Handler Page
@app.route("/forgot-password/check-email/", methods=['POST'])
def check_email():
	email = request.form['email']

	fetchUser = user.check_by_email(mongo,email)

	if(fetchUser):
		userid = fetchUser['username']
		session['userid_for_reset'] = userid
		return redirect("/reset-password/"+userid)
	else:
		return render_template('ForgotPas.html', status="User Not Registered") 


# Reset Password Handller Page
@app.route("/reset-password/updatePassword/<id>", methods=['POST'])
def update_password(id):
	password = request.form['password']
	c_password = request.form['c_password']
	
	if(password == c_password):
		userData = {
			"userid" : id,
			"new_pass" : password
		}
		updatedRec = user.updatePassword(mongo,userData)
		
		return redirect(url_for('root'))

	else:
		return render_template("ForgotPas.html",status="Incorrect Password")
	

# download report_data :
@app.route("/user/download-report/<id>", methods=['POST'])
def download_report_data(id):
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			report_id = request.form['report_id']
			reportData = report_model.find_by_report_id(mongo,id,report_id)
			if(reportData):
			
				report_data_list = []

				textareaList = []
				report_content_data = rd_model.getAllDownloadableDataById(mongo,id,report_id)

				for (a, b) in zip(reportData['report_fields_name'], reportData['report_fields_type']):
					if b == 'textarea':
						textareaList.append(a)

				for row in report_content_data:
					for ta in textareaList:
						if (ta in row):
							row[ta] = row[ta].replace("\n","").replace("\r","").replace("\t","")
						else:
							continue
					
					report_data_list.append(row)


				# return dumps(report_content_data)
				if(report_content_data):
					res_ob = {
						'report_title' : reportData['report_title'],
						'report_content' : report_data_list,
						'report_cols' : reportData['report_fields_name'],

					}
					return res_ob
			else:
				return render_template("ViewReportData.html", data = userData)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)

# Save the New Report : 
@app.route("/user/save-report/<id>", methods=['POST'])
def save_report(id):

	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			report_id = request.form['report_id']
			report_title = request.form['report_title']
			report_type = request.form['report_type']
			report_created_by = userData['username']
			report_created_on = request.form['report_created_on']
			report_fields_name = request.form.getlist('report_fields_name[]')
			report_fields_type = request.form.getlist('report_fields_type[]')
			reprot_last_edit = request.form['reprot_last_edit']
			new_report_last_edit = dt.strptime(reprot_last_edit, "%Y-%m-%dT%H:%M:%S.%fZ")
			

			report_data = {
				'report_id' : report_id,
				'report_title' : report_title,
				'report_type' : report_type,
				'report_created_by' : report_created_by,
				'report_created_on' : new_report_last_edit,
				'report_fields_name' : report_fields_name,
				'report_fields_type': report_fields_type,
				'reprot_last_edit' : new_report_last_edit
			}

			for (a, b) in zip(report_fields_name, report_fields_type):
				if (b == "checkbox" or b == "radio" or b == "select"):
					print(a)
					report_data[a] = request.form.getlist('labels['+a+'][]')
			
			
			saved_report = report_model.save_report_to_DB(mongo,report_data)
			current_report_count = userData['no_of_report_created']
			current_report_count = current_report_count + 1
			updated_report_count = user.updateReportCount(mongo,userData['username'],current_report_count)
			
			report_response = {
				'message' : "Report Added Successfully",
				'status' : "OK",
				'status_code' : 200
			}
			return report_response
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)		


# Save the Report Data
@app.route("/user/save-report-data/<id>/<report_id>", methods=['POST'])
def save_report_data(id,report_id):
	now = dt.now()
	RD_response = {
		"status" : "",
		"message" : ""
	}
	userData = user.find_by_userid(mongo,id)
	if(userData):
		if ('userid' in session) and (userData['username'] == session['userid']):
			reportData = report_model.find_by_report_id(mongo,id,report_id)
			if(reportData):

				report_cols = []
				colTypes = reportData['report_fields_type']

				for (a, b) in zip(reportData['report_fields_name'], colTypes):
					report_col = {
						'report_fields_name' : a.replace(" ","_").replace(".",""),
						'report_fields_type' : b
					}
					report_cols.append(report_col)

				# To Create the Data Object:
				report_form_data = {
					"report_data_id" : "RD"+id+"_"+now.strftime("%m%d%Y%H%M%S"),
					"report_id" : report_id,
					"report_created_by" : id
				}
				blank_field = ""
				for (f, t) in zip(reportData['report_fields_name'], colTypes):
					if(request.form[f.replace(" ","_")] != ""):
						if (t == "checkbox"):
							report_form_data[f.replace(" ","_")] = request.form.getlist(f.replace(" ","_"))
						else:
							report_form_data[f.replace(" ","_")] = request.form[f.replace(" ","_")]	
					else:
						blank_field = f.replace(" ","_")
						break

				# Validating the Data
				if (blank_field != ""):
					RD_response = {
						"status" : "False",
						"message" : blank_field+" Cannot be blank"
					}
					return render_template("ViewReport.html", data = userData, report_content = reportData, report_cols = report_cols, rd_response = RD_response)
				

				# Save the Report Data to DB:
				added_RD = rd_model.save_report_data_to_DB(mongo,report_form_data)
				if(added_RD):
					# update report_last edit
					report_last_edit = now.strftime("%d/%m/%Y %H:%M:%S")
					reportData = report_model.update_report_last_edit(mongo,id,report_id,report_last_edit)

					return redirect(url_for('load_user_report',id=id,report_id=report_id))
				else:
					RD_response = {
						"status" : "False",
						"message" : "Some thing went wrong"
					}
					return render_template("ViewReport.html", data = userData, report_content = reportData, report_cols = report_cols, rd_response = RD_response)
			else:
				return render_template("ViewReport.html", data = userData)
		else:
			response = {
				'status' : "False",
				'message' : "Session Expired"
			}
			return render_template("index.html", response = response)		
	else:
		response = {
			'status' : "False",
			'message' : "Invalid Userid"
		}
		return render_template("index.html", response = response)

if __name__ == "__main__":
	app.run()
# 	app.run(debug=True, host="0.0.0.0", port=3000)


