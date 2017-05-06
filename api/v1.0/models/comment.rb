require 'mongo_mapper'

class Comment
	
	include MongoMapper::Document
	include ModelHelpers
	
	key :message, String

	belongs_to :user
	belongs_to :commentable, :polymorphic => true

	timestamps!

end