require 'mongo_mapper'
require 'base64'

class FileDownload

	include MongoMapper::Document
	include ModelHelpers
	
	# Define keys
	key :mime, String, :required => true
	key :path, String

	key :action

	def to_b64
		Base64.encode64(File.read('../../../' + self.path))
	end

	timestamps!

	before_destroy :cleanup_file

	private

	def cleanup_file
		unless self.path.nil?
			file_path = '../../../' + self.path

			File.unlink(file_path) if File.exist?(file_path)
		end
	end

end
