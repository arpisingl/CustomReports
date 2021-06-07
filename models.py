class User():
	
	def add_user(mongo,data):
		M = mongo.db.User.insert_one(data)
		return M
		
	def find_user(mongo,data):
		user = mongo.db.User.find_one({"username" : data['username'],"password" : data['password']},{"username" : 1,"email":1})
		return user
		# return "user found"

	def check_by_email(mongo,email):
		user = mongo.db.User.find_one({"email" : email},{"_id":1,"username" : 1,"email":1})
		return user

	def updatePassword(mongo,data):
		U = mongo.db.User.update_one({"username" : data['userid']},{ '$set' : {'password': data['new_pass']} })
		return U

	def find_by_userid(mongo,userid):
		user = mongo.db.User.find_one({"username" : userid},{"username" : 1,"no_of_report_created" : 1, })
		return user

	def checkExistingUserid(mongo,userid):
		existing_user = mongo.db.User.find_one({"username" : userid},{"username" :1})
		return existing_user

	def checkExistingEmail(mongo,email):
		existing_user = mongo.db.User.find_one({"email" : email},{"email" :1})
		return existing_user	

	def updateReportCount(mongo,id,cnt):
		U = mongo.db.User.update_one({"username" : id},{ '$set' : {'no_of_report_created': cnt} })
		return U

class Reports():
	def save_report_to_DB(mongo,report_data):
		R = mongo.db.Report.insert_one(report_data)
		return R
		
	def find_recent_reports(mongo,user_id):
		reports = mongo.db.Report.find({"report_created_by": user_id}, {"report_id" :1,"report_title" :1,"report_type": 1,"report_created_on" : 1,"reprot_last_edit" : 1}).sort("report_id", -1).limit(3)
		return reports

	def fetch_all_reports(mongo,user_id):
		reports = mongo.db.Report.find({"report_created_by": user_id}, {"_id" :0,"report_title" :1,"report_type": 1,"report_fields_name" : 1,"report_id" : 1, "reprot_last_edit" : 1,"report_created_by":1}).sort("report_id", 1)
		return reports

	def find_by_report_id(mongo,id,report_id):
		report_data = mongo.db.Report.find_one({"report_id":report_id, "report_created_by" : id},{"_id":0})
		return report_data

	def find_report_by_title(mongo,report_title,id):
		report_data = mongo.db.Report.find_one({"report_title":report_title, "report_created_by" : id},{"report_id" :1 , "report_created_by":1})
		return report_data

	def delete_report(mongo,report_id,id):
		report_data = mongo.db.Report.delete_one({"report_id":report_id, "report_created_by" : id})
		return report_data