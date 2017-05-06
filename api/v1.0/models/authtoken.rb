require 'mongo_mapper'

class AuthToken

	include MongoMapper::Document
	include ModelHelpers

	# Define keys
	key :user_id, ObjectId, :required => true
	key :token, String, :required => true

	timestamps!
	
end