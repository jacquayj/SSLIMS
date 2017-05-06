require 'mongo_mapper'
require 'json'

require_relative 'init'

MongoMapper.database = 'dnatools_test'


# user = User.find('52b063d453be9335b27df28f')

# user.first_name = 'John'
# user.last_name = 'Jacquay'

# user.save

# puts user.serializable_hash


# r = AccountRequest.new(:first_name => 'John', :last_name => 'Jacquay', :email => 'omar.lopez@ufl.edu')

# r.save

# user = User.find('52b063d453be9335b27df28f')

# event = Event.new(:handler => 'displayAlert', :arguments => {:message => 'Name updated', :color => 'red'})
# user.events << event

# user.save

# User.find_each(:user_type => 'admin') do |user| 
# 	event = Event.new(:persist => true)
	
# 	event.event_object = DashboardAlert.new({:message => 'I like turtles~', :level => 'info'})

# 	user.events << event

# 	user.save
# end

User.find_each do |user| 
	event = Event.new

	event.event_object = CollectionUpdate.new(:name => 'AccountRequest', :model_id => self.id)

	user.events << event

	user.save
end


# puts event.serializable_hash
