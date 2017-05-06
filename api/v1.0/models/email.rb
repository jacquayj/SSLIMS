require 'mongo_mapper'

class Email

	include MongoMapper::Document
	include ModelHelpers
	
	# Define keys
	key :recipient, String
	key :subject, String
	key :message, String
	timestamps!

	# Define relationships
	belongs_to :user

	# Additional validations

end