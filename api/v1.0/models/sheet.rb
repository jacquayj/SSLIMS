require 'mongo_mapper'
require 'mongomapper_id2'

class Sheet

	include MongoMapper::Document
	include ModelHelpers

	# Define keys
	key :name, String
	key :type, String
	key :status, String
	key :plt_file, ObjectId
	key :wells, Object
	key :wells_config, Object
	timestamps!
	auto_increment!

	# Define relationships
	belongs_to :user
	belongs_to :instrument

	
	after_create :collection_update
	after_destroy :collection_update
	after_update :collection_update
	
	# Additional validations
	
end

