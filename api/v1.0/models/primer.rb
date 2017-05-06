require 'mongo_mapper'

class Primer

	include MongoMapper::Document
	include ModelHelpers
	
	key :name, String, :default => ''
	key :sequence, String, :default => ''
	key :melting_point, Integer

	after_create :collection_update
	after_destroy :collection_update
	after_update :collection_update

	timestamps!

end

