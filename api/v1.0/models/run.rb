require 'mongo_mapper'

class Run

	include MongoMapper::Document
	include ModelHelpers
	

 	many :comments, {:as => :commentable, :order => :created_at.asc}
 
 	timestamps!
 	
 	belongs_to :sheet
 	belongs_to :sample

 	before_destroy :cleanup_files

 	private

 	def cleanup_files
 		possible_files = [
			"ab1_file",
			"seq_file",
			"svg_file",
			"edited_ab1_file",
			"edited_seq_file",
			"edited_svg_file",
 		]

 		possible_files.each do |object_key|

 			file_reference = self[object_key]

 			unless file_reference.nil?
 				if file_reference.instance_of?(Array)
					file_reference.each do |file_id|
						f = FileDownload.find(file_id)

						f.destroy unless f.nil?
					end
 				else
 					f = FileDownload.find(file_reference)

					f.destroy unless f.nil?
 				end
 			end
 		end
 	end



end