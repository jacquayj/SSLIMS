require 'mongo_mapper'

class Instrument

	include MongoMapper::Document
	include ModelHelpers
	
	# Define keys
	key :alias, String
	key :application, String
	key :plate_sealing, String
	key :result_group, String
	key :instrument_protocol, String
	key :analysis_protocol, String
	key :photo_data, String
	key :photo_mime, String
	key :photo_file, ObjectId

	many :sheets

	after_create :collection_update
	after_destroy :collection_update
	after_update :collection_update

	timestamps!

end
