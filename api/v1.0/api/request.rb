require 'json'
require 'base64'
require 'digest/sha1'
require 'securerandom'
require 'zip'
require 'mail'
require 'pdfkit'
require 'tilt/erb'

require_relative 'error'

def to_boolean(str)
	str == 'true'
end

class APIRequest
	
	def initialize(opts)

		@options = opts

		# Make sure the collection exists
		raise APIError.new(404), "Not Found: resource #{@options[:params][:resource]} does not exist" if @options[:settings]['resources'][@options[:params][:resource]].nil?

		# Ensure the request method is allowed on the specific resource type
		raise APIError.new(405), "Method Not Allowed: \"#{@options[:request].request_method}\" not allowed on collections" if (!is_element? && (@options[:request].request_method == "PUT" || @options[:request].request_method == "DELETE"))
		raise APIError.new(405), "Method Not Allowed: \"#{@options[:request].request_method}\" not allowed on elements" if (is_element? && @options[:request].request_method == "POST")

		# Check permission file to see if the user is allowed to call the method on resource
		raise APIError.new(403), "Permission denied: User type \"#{@options[:user]['user_type']}\" cannot \"#{@options[:request].request_method}\" #{@options[:params][:resource]}" if !@options[:user].allowed_to?(@options[:request].request_method, @options[:params][:resource])

		host = @options[:settings]['smtp']['host']
		port = @options[:settings]['smtp']['port']

		# Configure mail settings
		Mail.defaults do
			delivery_method :smtp, address: host, port: port, enable_starttls_auto: false
		end

	end

	# Throws error if a key is found that doesn't exist in the model
	def validate_keys

		# Keys to remove from valid key list
		invalid_keys = ['_id', 'created_at', 'updated_at']

		# Remove invalid keys from list
		valid_keys = @model.keys.keys.map do |key|
			invalid_keys.include?(key) ? nil : key
		end

		# Strip nil values
		valid_keys.compact!

		# Throw error if key is not valid
		@options[:data].each_pair do |key, value|
			raise APIError.new(400), "Invalid key \"#{key}\"" if !valid_keys.include?(key)
		end

	end

	# Returns hash of model's fields along with it's relationships
	def get_model_fields(model)

		keys = model.keys.keys.map do |k|
			k == '_id' ? 'id' : k
		end
	
		model.associations.each do |key, assoc|

			case assoc

				when MongoMapper::Plugins::Associations::BelongsToAssociation, MongoMapper::Plugins::Associations::OneAssociation
					type = 'Object'
				when MongoMapper::Plugins::Associations::ManyAssociation
					type = 'Array'
				else
					type = 'Object'
			end

			#raise APIError.new(400), assoc

			if assoc.class_name == 'Commentable'
				assoc_model = Comment
			else
				assoc_model = Kernel.const_get(assoc.class_name)
			end


			assoc_fields = assoc_model.keys.keys.map do |k|
				k == '_id' ? 'id' : k
			end

			keys.push({:name => key, :type => type, :fields => assoc_fields})
		
		end

		keys
	end

	# Why is this needed? mongo_mapper should work if they key the correct data type (ObjectId)
	def convert_query_id(query, is_filter = false)
		if query.is_a? Hash
			query.keys.each do |key|
				if key == 'id'
					new_key = is_filter ? '_oid' : '_id'

					val = query.delete(key)

					if val.is_a? Hash
						val.keys.each do |key|
							begin
								val[key] = BSON::ObjectId(val[key])
							rescue
								
							end
						end
					else
						begin
							val = BSON::ObjectId(val)
						rescue
							
						end
					end

					query[new_key] = val
				else
					new_key = key
				end

				convert_query_id(query[new_key])
			end
		elsif query.is_a? Array
			query.each do |el|
				convert_query_id(el)
			end
		end

		query
	end

	def strip_revisions!(result)
		if result.is_a?(Hash)
			result.delete('_revisions') if result.has_key?('_revisions')
			result.each {|key, value| strip_revisions!(value) if value.is_a?(Hash) || value.is_a?(Array) }
		elsif result.is_a?(Array)
			result.each do |r|
				strip_revisions!(r)
			end
		end
	end

	# Processes all requests
	def process(http_response_obj)

		# Load model class reference from settings
		@model = @options[:settings]['resources'][@options[:params][:resource]]['model']

		join = @options[:params][:join].nil? ? true : to_boolean(@options[:params][:join])

		if is_element?

			# If referencing self in request
			@options[:params][:element_id] = @options[:user]['_id'] if @options[:params][:element_id] == 'me'

			# Set query if this is a request for element
			query = {
				'$and' => [
					{'_id' => @options[:params][:element_id]},
					{'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] }
				]
				
			}

			# Set query defaults for elements
			limit = 1
			offset = 0
			count = false
			sort = :_id.asc

		else
			# Parse query from base64 encoded url segment
			begin
				user_query = !@options[:params][:query].nil? ? convert_query_id(JSON.parse(Base64.decode64(@options[:params][:query]))) : {}
			rescue JSON::ParserError => e
				raise APIError.new(400), "Bad Request: Unable to parse JSON in query"
			end

			begin
				filter = !@options[:params][:filter].nil? ? convert_query_id(JSON.parse(Base64.decode64(@options[:params][:filter])), true) : nil
			rescue JSON::ParserError => e
				raise APIError.new(400), "Bad Request: Unable to parse JSON in filter"
			end

			query =  {
				'$and' => [
					user_query,
					{'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] }
				]
			}

			# Parse & set query params
			limit = @options[:params][:limit].nil? ? 10 : (@options[:params][:limit].to_i > 10000 ? 10000 : @options[:params][:limit].to_i)
			offset = @options[:params][:offset].nil? ? 0 : @options[:params][:offset].to_i
			count = !@options[:params][:count].nil?
			sort = :_id.asc

			# Prepare sort params for use in mongo_mapper query
			if !@options[:params][:sort].nil?

				# Extract field and direction
				field, direction = @options[:params][:sort].strip.split ','

				field = (field == 'id') ? '_id' : field

				# Was the direction specified?
				if !direction.nil?
					if direction == "asc"
						sort = field.to_sym.asc
					elsif direction == "desc"
						sort = field.to_sym.desc
					else
						sort = field.to_sym.asc
					end
				else
					# Default to asc
					sort = field.to_sym.asc
				end

			end
		end

		associations = join ? @model.associations.keys : []

		# Don't include events when querying User collection
		associations.delete(:events) if @model.collection_name == 'users'

		# Where specific fields to return specified?
		if @options[:params][:fields].nil?
			fields = []
		else
			# Clean up, turn into array to pass into mongo_mapper
			@options[:params][:fields].strip!

			@options[:params][:fields].sub!(/^\,*/, '')
			@options[:params][:fields].sub!(/\,*$/, '')

			fields = @options[:params][:fields].split(',').map { |field| field.strip }
		end

		# Filter input with lambdas defined in settings
		before(query)

		# Perform specified action using sanitized input
		case @options[:request].request_method
			when "GET" # Collections & elements

				if filter.nil? || (filter.empty? && @options[:params][:sort].nil?)
					# If query is specified, use it
					q = @model.where(query).fields(*fields).sort(sort).limit(limit).skip(offset)

					begin
						result_count = q.count
					rescue Exception => e
						result_count = 0
					end
					

					# Return the number of results? (Note: limit and skip do not change the result of this)
					if count
						result = result_count
					else
						begin
							result = q.all
						rescue Exception => e
							result = []
						end
						
						# Convert result model object to hash
						# Is this a request for single element?
						if is_element?
							raise APIError.new(404), "Not Found: Unable to find element" if result[0].nil?

							#raise APIError.new(404), "#{result[0].id}"

							result = result[0].serializable_hash(:include => associations)
						else
							result.map! { |r| r.serializable_hash(:include => associations) }
						end
					end

				else

					# If query is specified, use it
					q = @model.where(query).fields(*fields)

					q_count = q.count

					if q_count > 0
						tmp_name = ''
						
						loop do 
							tmp_name = 'tmp_' + SecureRandom.hex
							break if !MongoMapper.database.collection_names.include?(tmp_name)
						end 

						tmp = MongoMapper.database[tmp_name]

						records = []
						q.all.each do |r|
							h = r.serializable_hash(:include => associations)
							h['_oid'] = h.delete 'id'
							h['created_at'] = DateTime.parse(h['created_at']).to_time.utc
							h['updated_at'] = DateTime.parse(h['updated_at']).to_time.utc
							records.push h
						end
						tmp.insert records


						result_cursor = tmp.find(filter).sort([[sort.field.to_s, sort.operator.to_sym]]).skip(offset).limit(limit)

						result_count = result_cursor.count

						# Return the number of results? (Note: limit and skip do not change the result of this)
						if count
							result = result_count
						else
							result = result_cursor.to_a.map do |record|
								record.delete '_id'
								record['id'] = record.delete('_oid')

								record['created_at'] = DateTime.parse(record['created_at'].to_s).rfc2822 unless record['created_at'].nil?
								record['updated_at'] = DateTime.parse(record['updated_at'].to_s).rfc2822 unless record['updated_at'].nil?

								unless record['_revisions'].nil?
									record['_revisions'].each do |r|
										r['created_at'] = DateTime.parse(r['created_at'].to_s).rfc2822 unless r['created_at'].nil?
										r['updated_at'] = DateTime.parse(r['updated_at'].to_s).rfc2822 unless r['updated_at'].nil?
									end
								end

								record
							end

							# Convert result model object to hash
							# Is this a request for single element?
							if is_element?
								raise APIError.new(404), "Not Found: Unable to find element" if result[0].nil?

								result = result[0]
							end
						end

						tmp.drop
					else
						if count
							result = result_count
						else
							result = []

							raise APIError.new(404), "Not Found: Unable to find element" if is_element?
						end
					end

				end


			when "POST" # Only collections

				# Throws error if a key is found that doesn't exist in the model
				validate_keys

				# Create new record with input
				record = @model.new(@options[:data])

				# Try to save it
				raise APIError.new(400, record.errors.to_hash) if !record.save

				# Convert to hash
				result = record.serializable_hash(:include => associations)
				@record = record

			when "PUT" # Only elements

				# Get the element that matches
				record = @model.find(query['$and'][0]['_id'])

				# Does the element exist?
				raise APIError.new(404), "Not Found: Unable to find element to update" if record.nil?
				
				# Throws error if a key is found that doesn't exist in the model
				validate_keys

				update_model(record, @options[:data])

				raise APIError.new(400, record.errors.to_hash) if !record.save
				
				# Convert to hash
				result = record.serializable_hash(:include => associations)
				@record = record
			when "DELETE" # Only elements

				# Get the element that matches
				record = @model.find(query['$and'][0]['_id'])

				# Does the element exist?
				raise APIError.new(404), "Not Found: Unable to find element to delete" if record.nil?
				
				if @options[:params][:hard].nil?

					record['deleted'] = true
					record.save

				else
					recycled_hash = record.serializable_hash.merge({'_collection_name' => @model.collection_name, '_oid' => record.id})

					recycled_hash.delete 'id'

					# Recycle the data because we love earth
					RecycleBin.new(recycled_hash).save

					# Delete record
					record.destroy
				end

				result = {success: true}
		end

		@options[:user].use_token if @options[:user].valid_token?

		content_type = 'application/json'
		download_filename = ''

		# Filter output with lambdas defined in settings
		result = after(result, content_type, download_filename)


		strip_revisions!(result) if @options[:params][:revisions].nil?


		if result.is_a?(Hash) || result.is_a?(Array)
			response = {:data => result}
			response[:fields] = get_model_fields(@model) if @options[:request].request_method != "DELETE"
			response[:query_result_count] = result_count if !result_count.nil?

			http_response = JSON.pretty_generate(:api_version => @options[:settings]['api_version'], :error => 0, :result => response)
		else
			http_response_obj.headers['Content-Disposition'] = "attachment; filename=\"#{download_filename}\"" if !@options[:params][:download].nil? && download_filename != ''

			http_response = result
		end

		return {:msg => http_response, :content_type => content_type}
	end

	private

	def is_element?
		!@options[:params][:element_id].nil?
	end

	def well_index_to_name(index)
		index = index.to_i + 1
		row_index = (index / 12.to_f).ceil - 1
		rows = 'A'.upto('H').to_a

		item_index = 12 - (((row_index + 1) * 12) - index)

		rows[row_index] + item_index.to_s
	end

	def filter_hash(hash, keys)
		new_hash = {}

		keys.each do |f|
			new_hash[f] = hash[f] if hash.has_key?(f)
		end

		hash.replace new_hash
	end

	def well_index_to_vert(index)
		index = index.to_i + 1
		
		row_index = (index / 12.to_f).ceil - 1
		col_index = 12 - (((row_index + 1) * 12) - index)

		new_index = ((col_index - 1) * 8) + row_index

		new_index + 1
	end

	def generate_reactionlog_pdf(sheet)

		pdf_html = @options[:sinatra_app].erb(:reaction_log, :locals => {:sheet => sheet})

		Thread.new do
			kit = PDFKit.new(pdf_html,
				:page_size => 'Letter',
				:margin_top => '80px',
				:margin_right  => '200px',
				:margin_bottom => '80px',
				:margin_left   => '200px'
			)
			pdf = kit.to_pdf

			pdf_file = FileDownload.new
			pdf_file.mime = 'application/pdf'
			pdf_file.path = 'data-mount/sample_sheets/reaction-log-' + sheet.id + '.pdf'
			pdf_file.save
			
			File.open('../' + pdf_file.path, 'w') { |file| file.write(pdf) }

			sheet['reactionlog_file'] = pdf_file.id

			sheet.save
		end
	end

	def generate_instrumentlog_pdf(sheet)

		pdf_html = @options[:sinatra_app].erb(:instrument_log, :locals => {:sheet => sheet})

		Thread.new do
			kit = PDFKit.new(pdf_html,
				:page_size => 'Letter',
				:margin_top => '80px',
				:margin_right  => '200px',
				:margin_bottom => '80px',
				:margin_left   => '200px'
			)
			pdf = kit.to_pdf

			pdf_file = FileDownload.new
			pdf_file.mime = 'application/pdf'
			pdf_file.path = 'data-mount/sample_sheets/instrument-log-' + sheet.id + '.pdf'
			pdf_file.save
			
			File.open('../' + pdf_file.path, 'w') { |file| file.write(pdf) }

			sheet['instrumentlog_file'] = pdf_file.id

			sheet.save
		end

	end


	def escape_filename(filename)
		filename.gsub(/[^a-zA-Z0-9\-\._]+/, '')
	end


	def create_zip_archive(file_prefix, samples, sheet_id, model)
		combined_new_file = {
			"archive" => true,
			"mime" => "application/zip",
			"file_name" => file_prefix + "-combined.zip",
			"files" => []
		}

		combined_ab1_seq_file = {
			"archive" => true,
			"mime" => "application/zip",
			"file_name" => file_prefix + "-ab1-seq.zip",
			"files" => []
		}

		ab1_new_file = {
			"archive" => true,
			"mime" => "application/zip",
			"file_name" => file_prefix + "-ab1.zip",
			"files" => []
		}

		seq_new_file = {
			"archive" => true,
			"mime" => "application/zip",
			"file_name" => file_prefix + "-seq.zip",
			"files" => []
		}

		svg_new_file = {
			"archive" => true,
			"mime" => "application/zip",
			"file_name" => file_prefix+ "-svg.zip",
			"files" => []
		}

		samples.each do |s|

			r = Run.where(:sample_id => s.id).last

			next if r.nil?

			sheet_files_query = {'$or' => []}

			unless r['svg_file'].nil?
				sheet_files_query['$or'].push({id: r.seq_file})
				sheet_files_query['$or'].push({id: r.ab1_file})

				r.svg_file.each do |file_id|
					sheet_files_query['$or'].push({id: file_id})
				end
			end

			unless r['edited_svg_file'].nil?
				sheet_files_query['$or'].push({id: r['edited_seq_file']}) 
				sheet_files_query['$or'].push({id: r['edited_ab1_file']}) 

				r['edited_svg_file'].each do |file_id|
					sheet_files_query['$or'].push({id: file_id})
				end
			end

			FileDownload.where(sheet_files_query).all.each do |f|
				combined_new_file['files'].push f.path

				ext = File.extname(f.path)

				combined_ab1_seq_file['files'].push(f.path) if ext == '.ab1' || ext == '.seq'

				ab1_new_file['files'].push(f.path) if ext == '.ab1'
				seq_new_file['files'].push(f.path) if ext == '.seq'
				svg_new_file['files'].push(f.path) if ext == '.svg'
			end
		end

		combined_zip_file = FileDownload.new(combined_new_file)
		combined_zip_file.save

		combined_zip_ab1_seq_file = FileDownload.new(combined_ab1_seq_file)
		combined_zip_ab1_seq_file.save

		ab1_zip_file = FileDownload.new(ab1_new_file)
		ab1_zip_file.save

		seq_zip_file = FileDownload.new(seq_new_file)
		seq_zip_file.save

		svg_zip_file = FileDownload.new(svg_new_file)
		svg_zip_file.save

		model['combined_archive'] = {} if model['combined_archive'].nil? 
		model['combined_archive']['zip'] = combined_zip_file.id

		model['combined_ab1_seq_archive'] = {} if model['combined_ab1_seq_archive'].nil? 
		model['combined_ab1_seq_archive']['zip'] = combined_zip_ab1_seq_file.id

		model['ab1_archive'] = {} if model['ab1_archive'].nil? 
		model['ab1_archive']['zip'] = ab1_zip_file.id

		model['seq_archive'] = {} if model['seq_archive'].nil? 
		model['seq_archive']['zip'] = seq_zip_file.id

		model['svg_archive'] = {} if model['svg_archive'].nil? 
		model['svg_archive']['zip'] = svg_zip_file.id

		model.save
	end

	def show_admin_info(msg)
		User.find_each(:'$or' => [{:user_type => 'admin'}, {:user_type => 'staff'}]) do |user| 
			event = Event.new(:persist => true)
			event.event_object = DashboardAlert.new(:message => msg, :level => 'info')
			user.events << event
			user.save
		end
	end

	def update_run_record(run, chromatogram, sample, sheet, edited = false)
		file = @record
	
		name = chromatogram.name
		svgs = chromatogram.svg

		if edited
			fasta = chromatogram.edited_fasta
		else
			fasta = chromatogram.fasta
		end
		
		comment = chromatogram.comment
	
		well_index = sheet.wells.key(sample.id.to_s)

		base_name = well_index_to_name(well_index) + "_" + name
		base_name = "edited-" + base_name if edited

		base_request_path = 'data-mount/requests/' + escape_filename(sample.request.name)

		Dir.mkdir('../' + base_request_path + '/samples') if !Dir.exists?('../' + base_request_path + '/samples')

		file.path = base_request_path + '/samples/' + base_name + '.ab1'

		# write ab1 file to file path 
		File.open('../' + file.path, 'w') { |f| f.write(chromatogram.data) }		
		file.save

		# Save .seq file to FS
		seq_file = FileDownload.new
		seq_file.mime = 'text/plain'
		seq_file.path = 'data-mount/requests/' + escape_filename(sample.request.name) + '/samples/' + base_name + '.seq'
		File.open('../' + seq_file.path, 'w') { |f| f.write(fasta) }
		seq_file.save

		# Save .svg files to FS
		svg_ids = []
		svg_paths = []
		svgs.to_a.each_with_index do |svg, index|
			svg_file = FileDownload.new
			svg_file.mime = 'image/svg+xml'
			svg_file.path = 'data-mount/requests/' + escape_filename(sample.request.name) + '/samples/' + base_name + '-' + index.to_s + '.svg'
			File.open('../' + svg_file.path, 'w') { |f| f.write(svg.to_s) }
			svg_file.save
			
			svg_ids.push svg_file.id
			svg_paths.push svg_file.path
		end

		run['sheet_id'] = sheet.id
		run['sample_id'] = sample.id

		if edited
			run['edited_svg_file'] = svg_ids
			run['edited_seq_file'] = seq_file.id
			run['edited_ab1_file'] = file.id 
		else
			run['svg_file'] = svg_ids
			run['seq_file'] = seq_file.id
			run['ab1_file'] = file.id 
		end
		run.save

		# Update sample status to Sequencing complete
		update_model(sample, {'status': 'Sequencing complete'})
		sample.save

		# Check to see if request is complete?
		is_request_complete = true
		request_samples = Sample.where(:request_id => sample.request.id).all
		request_samples.each do |s|
			if s.status != 'Sequencing complete'
				is_request_complete = false
				break
			end
		end

		if is_request_complete
			request = sample.request
			request.complete = true
			request.save

			Thread.new do
			
				# Create request zip if it is
				create_zip_archive('request-' + sample.request.name, request_samples, sheet.id, sample.request)

				begin
					ilab_client = ILab::API.new(
						:version => 1,
						:debug => false,
						:auth => 'ydzsB7jvno0YKzUomost+qtdiVqVLAmA/9+P4f0XN7c9qExI4w8wTsy4PeTVRakuplnvS9eW53LgdTpWNDOKCA=='
					)
					sanger_sequencing = ilab_client.cores.find('ICBR Sanger Sequencing')
					now = Time.now.iso8601

					milestone = sanger_sequencing.service_requests.find(request.name).milestones.find('Sequencing')
					milestone.update(milestone.to_hash.merge({
						'completed_on' => now
					}))
				rescue Exception => e
					puts e.to_s
				end
			end
		end

		# Update sample sheet status if needed
		num_of_uploaded_runs = Run.where(:sheet_id => sheet.id).count

		# Is the sheet complete?
		if (num_of_uploaded_runs >= sheet.wells.length) && num_of_uploaded_runs.modulo(sheet.wells.length).zero?
			update_model(sheet, {'status': 'Sequencing complete'})

			# Get list of samples in this sheet
			sheet_samples_query = {'$or' => []}
			sheet.wells.each do |well_index, sample_id|
				sheet_samples_query['$or'].push({'id' => BSON::ObjectId(sample_id)})
			end
			sheet_samples = Sample.where(sheet_samples_query).all

			create_zip_archive('sheet-' + sheet.id, sheet_samples, sheet.id, sheet)

			show_admin_info 'Run data for sheet <a href="#sheets/' + sheet.id + '">"' + sheet.name + '"</a> imported' unless edited

		elsif sheet.status == 'Waiting to be sequenced'
			update_model(sheet, {'status': 'Sequencing initiated'})
		end


		sheet.save

		run

	end


	def update_model(model, changes)
		revision = {}

		# Update record and refresh it's data
		changes.each_pair do |key, value|
			if model[key] != value
				revision[key] = model[key]
				model[key] = value
			end
		end

		model['_revisions'] = [] if model['_revisions'].nil?
		model['_revisions'].push({'data' => revision, 'created_at' => Time.new, 'user_id' => @options[:user]['_id']}) if !revision.empty?
	end

	# Runs lambdas located in config file to validate and sanitize requests
	def before(query)

		# Get lambdas that run for specific user types
		@permission_lambdas = @options[:settings]['permissions'][@options[:user]['user_type']][@options[:params][:resource]][@options[:request].request_method]

		# Get generic lambdas that run for all user types
		@generic_lambdas = @options[:settings]['resources'][@options[:params][:resource]][@options[:request].request_method]

		
		# Run generic
		instance_exec({:data => @options[:data], :user => @options[:user], :request => @options[:request], :params => @options[:params], :query => query, :settings => @options[:settings]},
			&@generic_lambdas['before']) if !@generic_lambdas['before'].nil?
		
		# Run user specific
		instance_exec({:data => @options[:data], :user => @options[:user], :request => @options[:request], :params => @options[:params], :query => query, :settings => @options[:settings]},
			&@permission_lambdas['before']) if @permission_lambdas.class == Hash && !@permission_lambdas['before'].nil?

	end

	def after(result, content_type, filename)
		# Run post-processing lambdas
		result = instance_exec(result, content_type, filename, @options[:user], &@generic_lambdas['after']) if !@generic_lambdas['after'].nil?
		result = instance_exec(result, content_type, filename, @options[:user], &@permission_lambdas['after']) if @permission_lambdas.class == Hash && !@permission_lambdas['after'].nil?

		result
	end

end
