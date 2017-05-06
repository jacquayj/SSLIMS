
module ModelHelpers

	def deep_copy(o)
		Marshal.load(Marshal.dump(o))
	end

	def serializable_hash(options = {})
		hash = deep_copy(super(options))

		hash['created_at'] = hash['created_at'].rfc2822 unless hash['created_at'].nil?
		hash['updated_at'] = hash['updated_at'].rfc2822 unless hash['updated_at'].nil?

		unless hash['_revisions'].nil?
			hash['_revisions'].each do |r|
				r['created_at'] = r['created_at'].rfc2822
			end
		end

		hash
	end

	def collection_update


		# Trigger collection update for all users
		# User.find_each do |user| 
		# 	event = Event.new
		# 	event.event_object = CollectionUpdate.new(:name => self.class.to_s, :model_id => self.id)
		# 	user.events << event
		# 	user.save
		# end


	end

	def get_binding
		binding
	end
end


require_relative 'user'
require_relative 'request'
require_relative 'sample'
require_relative 'comment'
require_relative 'run'
require_relative 'sheet'
require_relative 'instrument'
require_relative 'option'
require_relative 'alerttemplate'
require_relative 'email'
require_relative 'authtoken'
require_relative 'recyclebin'
require_relative 'event'
require_relative 'accountrequest'
require_relative 'filedownload'
require_relative 'primer'