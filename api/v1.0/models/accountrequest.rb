require 'mongo_mapper'

class AccountRequest

	include MongoMapper::Document
	include ModelHelpers

	# Define keys
	key :first_name, String, :required => true
	key :last_name, String, :required => true
	key :email, String, :required => true, :unique => true
	key :message, String
	timestamps!

	# Additional validations
	validates_format_of :email, :with => /\A([-a-z0-9!\#$%&'*+\/=?^_`{|}~]+\.)*[-a-z0-9!\#$%&'*+\/=?^_`{|}~]+@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i, :on => :create

	after_create :collection_update, :show_alert
	after_update :collection_update
	after_destroy :collection_update

	private

	def show_alert
		# Show alert to admin users
		User.find_each(:user_type => 'admin') do |user| 
			event = Event.new(:persist => true)
			event.event_object = DashboardAlert.new(:message => 'An account request has been received, view the request <a href="#accountrequest/' + self.id + '/approve">here</a>.', :level => 'warn')
			user.events << event
			user.save
		end
	end


end
