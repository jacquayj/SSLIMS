require 'mongo_mapper'

class Sample

	include MongoMapper::Document
	include ModelHelpers
	
	# Define keys
	key :name, String, :default => ''
	key :concentration, Integer
	key :inx, Integer
	key :dna_ug, Integer, :default => ''
	key :dna_type, String, :default => ''
	key :dna_bp_size, Integer
	key :special_request, String, :default => ''
	key :status, String
	key :sheet_indexs, Object, :default => {}

	timestamps!

	# Define relationships
	belongs_to :request
	many :runs

	# Many-to-one hack
	key :primer_id, ObjectId

	after_create :collection_update
	after_destroy :collection_update
	after_update :collection_update

    def primer
        Primer.find(primer_id)
    end

    def primer=(primer)
        primer_id = primer.id
    end
	
	def serializable_hash(options = {})
		hash = super(options)
		hash.merge!({'primer' => primer.serializable_hash}) if !primer.nil?
		hash
	end

end