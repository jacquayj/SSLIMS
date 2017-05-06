require 'mongo_mapper'

class AlertTemplate

	include MongoMapper::Document
	include ModelHelpers
	
	# Define keys

	timestamps!

	# Define relationships

	after_create :collection_update
	after_destroy :collection_update
	after_update :collection_update


	# Additional validations

end