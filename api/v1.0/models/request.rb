require 'mongo_mapper'

class Request

	include MongoMapper::Document
	include ModelHelpers
	
	key :name, String
	key :ilab_id, Integer
	key :status, String
	key :service_type, String
	key :location, String

	key :pi_name, String
	key :contact_phone, String

	key :ilab_user, Object

	key :additives, Boolean
	key :print, Boolean
	key :primer_design, Integer
	key :primer_sythesis, Integer
	key :reaction_mix_order, String
	key :notes, String
	key :begun, Boolean
	key :complete, Boolean, :default => false

	key :pdf_file, ObjectId

	many :samples
	many :comments, {:as => :commentable, :order => :created_at.asc}

	belongs_to :user

	timestamps!

	after_create :collection_update, :show_alert
	after_destroy :collection_update
	after_update :collection_update

	private

	def show_alert
		# Show alert to admin users
		User.find_each(:'$or' => [{:user_type => 'admin'}, {:user_type => 'staff'}]) do |user| 
			event = Event.new(:persist => false)
			event.event_object = DashboardAlert.new(:message => 'A new <a href="#requests/' + self.id + '">request: "' + self.name + '" has been received</a>.', :level => 'info')
			user.events << event
			user.save
		end
	end

end

