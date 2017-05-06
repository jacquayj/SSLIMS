class Event

	include MongoMapper::Document
	include ModelHelpers

	one :event_object, :polymorphic => true

	key :delivered, Boolean, :default => false
	key :persist, Boolean, :default => false

	belongs_to :user

	timestamps!
end

class EventObject
	include MongoMapper::EmbeddedDocument
	
	embedded_in :event
end

class DashboardAlert < EventObject

	key :level, String
	key :message, String
	key :unique_identifier, String

end

class CollectionUpdate < EventObject

	key :name, String
	key :model_id, ObjectId

end

