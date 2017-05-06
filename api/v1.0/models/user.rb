require 'mongo_mapper'

class User

	include MongoMapper::Document
	include ModelHelpers
	
	# Define keys
	key :user_type, String, :required => true
	key :client_api_key, String
	key :first_name, String
	key :last_name, String
	key :name, String
	key :status, String
	key :email, String
	timestamps!

	# Define relationships
	many :sheets
	many :events # This causes all events a user has ever had to be joined - no megusta, should reenable when joins are disabled by default
	many :requests

	# Additional validations
	#validates_format_of :email, :with => /\A([-a-z0-9!\#$%&'*+\/=?^_`{|}~]+\.)*[-a-z0-9!\#$%&'*+\/=?^_`{|}~]+@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i, :on => :create

	after_create :collection_update
	after_destroy :collection_update
	#after_update :collection_update

	private

	# def show_alert
	# 	# Show alert to admin users
	# 	User.find_each(:user_type => 'admin') do |user| 
	# 		event = Event.new(:persist => true)
	# 		event.event_object = DashboardAlert.new(:message => 'An account request has been received, view the request <a href="#accountrequest/' + self.id + '/approve">here</a>.', :level => 'warn')
	# 		user.events << event
	# 		user.save
	# 	end
	# end


end
