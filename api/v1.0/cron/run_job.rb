require 'active_support'
require 'json'
require 'erb'
require 'ostruct'
require 'securerandom'
require 'pp'
require 'pdfkit'
require 'mail'
require 'rqrcode'
require 'fileutils'
require 'rack/mime'
require 'rack/utils'
require 'time'

require_relative '../lib/easycron'
require_relative '../lib/ilab'
require_relative '../lib/emailtemplate'
require_relative '../models/init'

Dir.chdir(File.dirname(__FILE__))

STDOUT.sync = true

class CronJobs < EasyCron

	# Load config file into memory
	CONFIG = eval(File.read('../settings.rb'))

	# Setup MongoMapper ORM
	MongoMapper.connection = Mongo::Connection.new(CONFIG['database']['hostname'])
	MongoMapper.database = CONFIG['database']['name']
	MongoMapper.connection[CONFIG['database']['name']].authenticate(CONFIG['database']['username'], CONFIG['database']['password'])

	# Configure mail settings
	Mail.defaults do
		delivery_method :smtp, address: CONFIG['smtp']['host'], port: CONFIG['smtp']['port'], enable_starttls_auto: false
	end

	def purge_expired
		expired = AuthToken.where(:created_at => {
			:$lt => Time.now - (24 * 60 * 60)
		}).all

		expired.each do |auth_token|
			RecycleBin.new(auth_token.serializable_hash.merge({'_collection_name' => auth_token.class.collection_name})).save
			auth_token.destroy
		end
	end

	def clean_db
		#puts 'Cleaning up database'

		# delete orphaned files
		
		# request: photo
		# run: ab1_file, seq_file, svg_file[], edited_ab1_file, edited_seq_file, edited_svg_file[]
		# sheet: plt_file
		# instrument: photo_file
		FileDownload.all.each do |file|
			next if Request.where('$or' => [{:photo => file.id}, {:pdf_file => file.id}, {'combined_archive.zip' => file.id}, {'ab1_archive.zip' => file.id}, {'seq_archive.zip' => file.id}, {'svg_archive.zip' => file.id}]).count > 0
			next if Sheet.where('$or' => [{:plt_file => file.id}, {:reactionlog_file => file.id}, {:instrumentlog_file => file.id}]).count > 0
			next if Instrument.where(:photo_file => file.id).count > 0
			next if Run.where('$or' => [
				{:ab1_file => file.id},
				{:seq_file => file.id},
				{:svg_file => file.id},
				{:edited_ab1_file => file.id},
				{:edited_seq_file => file.id},
				{:edited_svg_file => file.id}
			]).count > 0

			#puts 'Found orphaned file record: ' + file.id.to_s

			# Doesnt work because some file records reference the same FS file
			#File.delete('../../../' + file.path) if File.exists?('../../../' + file.path)
			#file.destroy
		end

		# need to find orphaned FS files

		# delete orphaned samples request_id: null
		Sample.where(:request_id => nil).each {|s| puts 'Found orphaned sample: ' + s.id.to_s; s.destroy }

		Sample.all.each do |s|
			if s.request.nil?
				puts 'Found orphaned sample record: ' + s.id.to_s
				s.destroy 
			end
		end

		# delete events delivered: true or (persist: false and created_at < now - 60sec)
		#Event.where('$or' => [{'delivered' => true}, {'$and' => [{'persist' => false}, {'created_at' => {'$lt' => (Time.now - 120)} }]}]).each {|e| puts 'Found expired event: ' + e.id.to_s; e.destroy }
		#Event.where('$and' => [{'persist' => false}, {'created_at' => {'$lt' => (Time.now - 120)} }]).each {|e| puts 'Found expired event: ' + e.id.to_s; e.destroy }

	end

	def erb(template, vars)
		ERB.new(template).result(OpenStruct.new(vars).instance_eval { binding })
	end

	def process_sample_grid(grid)

		inx = 1

		grid = JSON.parse(grid)
		grid.map! do |row|
			next nil if row.all? { |cell| cell.nil? || cell.length == 0 }
			
			map = ['name', 'concentration', 'dna_ug', 'dna_type', 'dna_bp_size', 'dna_primer', 'special_request']
			mapped = {}
			row.each_with_index {|cell, index| mapped[map[index]] = cell }

			mapped['name'].gsub!(/[^A-Za-z0-9\-_]/, '')

			mapped['inx'] = inx
			inx += 1

			mapped['dna_bp_size'] = mapped['dna_bp_size'].to_i
			mapped['dna_ug'] = mapped['dna_ug'].to_i
			mapped['concentration'] = mapped['concentration'].to_i
			mapped['status'] = 'Waiting to receive'

			primer = Primer.all(:name => mapped['dna_primer'])[0]
			primer = Primer.create({
				'name' => mapped['dna_primer'],
				'sequence' => '',
				'melting_point' => nil
			}) if primer.nil?

			mapped.delete 'dna_primer'

			mapped['primer_id'] = primer.id

			Sample.create(mapped)
		end

		s = grid.compact!

		(s || [])
	end

	def generate_pdf(request, request_path) # FIX ME DELETE OLD FILE ON CREATE IF NEEDED

		puts 'Generating request PDF'

		pdf_html = erb(File.read('../views/request_pdf.erb'), request.serializable_hash(:include => [:samples, :comments, :user]).merge(
			{qr: RQRCode::QRCode.new(JSON.generate({id: request.id}))}
		))

		kit = PDFKit.new(pdf_html, :page_size => 'Letter')
		pdf = kit.to_pdf

		pdf_file = FileDownload.new
		pdf_file.mime = 'application/pdf'
		pdf_file.path = 'data-mount/requests/' + request.name + '/request.pdf'
		pdf_file.save
		
		File.open(request_path + '/request.pdf', 'w') { |file| file.write(pdf) }

		request.pdf_file = pdf_file.id
		request.save

		pdf
	end

	def ilab_submission_to_hash(r, ilab_client)

		puts 'Converting iLab request to SSLIMS DB record'

		# Extract custom form data from iLab API response
		submission = r.custom_forms.all[0].to_hash
		
		request = {}
		request['ilab_user'] = r['owner']
		request['name'] = r['name']
		request['ilab_id'] = r['id'].to_i

		# Create the request directory if it doesn't exist
		request_path = '../../../data-mount/requests/' + request['name']
		Dir.mkdir(request_path) unless File.exists?(request_path)

		# Map the iLab custom form fields to the request hash we're building
		submission['fields'].each do |field|
			request[field['identifier']] = field['value']
		end

		# Delete the checkbox fields if they exist
		request.delete '_1' if request.has_key? '_1'
		request.delete '_2' if request.has_key? '_2'
		request.delete 'Instructions___PLEASE_READ_BEFORE_ENTERING_TABLE__' if request.has_key? 'Instructions___PLEASE_READ_BEFORE_ENTERING_TABLE__'

		# No photo file
		if request['photo'].nil?
			request['photo'] = BSON::ObjectId('561539ac8583dd02ac38a961')
		else
			puts 'Downloading request photo'

			begin
				photo_file_bin = ilab_client.http_request(:url => 'https://api.ilabsolutions.com/v1/attachments/' + request['photo'], :json => false)

				photo_path = request_path + '/photo.tmp'
				open(photo_path, 'wb') do |file|
					file.write(photo_file_bin)
				end

				photo_mime_type = `file -bi #{photo_path}`.split(';')[0]

				photo_extension = Rack::Mime::MIME_TYPES.invert[photo_mime_type]

				FileUtils.mv photo_path, request_path + '/photo' + photo_extension

				photo_file = FileDownload.new
				photo_file.mime = photo_mime_type
				photo_file.path = 'data-mount/requests/' + request['name'] + '/photo' + photo_extension
				photo_file.save

				request['photo'] = photo_file.id
			rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
				puts 'Error with iLab API downloading request photo'
				
				puts Time.now.to_s
				puts e.to_s
				puts e.backtrace

				show_admin_fatal 'There was a problem connecting to the iLab API to download request photo, request import failed. Please contact support.', 'ilab-photo-download'
			end
			
		end

		first_name, last_name = request.delete('dd_name').strip.split(' ')
		email = request.delete('dd_email')

		first_name = '' if first_name.nil?
		last_name = '' if last_name.nil?

		customer = User.all(:email => email)[0]
		customer = User.create({
			'user_type' => 'customer',
			'client_api_key' => SecureRandom.uuid,
			'first_name' => first_name,
			'last_name' => last_name,
			'email' => email,
			'status' => 'active'
		}) if customer.nil?

		request['user_id'] = customer.id

		request['samples'] = process_sample_grid(request.delete('r_samples')) if !request['r_samples'].nil?

		request['deleted'] = true if request['samples'].nil? || request['samples'].empty?

		request
	end

	# move to request model?
	def send_request_email(request, pdf, update = false)
		puts 'Sending request received email'

		if update
			email_template = AlertTemplate.find('56044fb4a3a6176d9e00019d')
		else
			email_template = AlertTemplate.find('5463cb0ebe50ca17df000001')
		end

		template = EmailTemplate.new(email_template.subject, email_template.message).generate_email({
			'request' => request.serializable_hash(:include => [:samples, :comments, :user])
		})

		to_field = "#{request.user.first_name} #{request.user.last_name} <#{request.user.email}>"

		unless request.ilab_user.nil?
			if request.ilab_user['email'] != request.user.email
				to_field += ", #{request.ilab_user['first_name']} #{request.ilab_user['last_name']} <#{request.ilab_user['email']}>"
			end
		end

		mail = Mail.new do
			from "#{CONFIG['smtp']['sender']['name']} <#{CONFIG['smtp']['sender']['email']}>"
			to to_field
			subject template[:subject]
			body template[:body]
			add_file :filename => "#{request.name}.pdf", :content => pdf
		end
		
		begin
			mail.deliver!
		rescue Exception => e
			puts 'SMTP server down, email not sent'

			puts Time.now.to_s
			puts e.to_s
			puts e.backtrace

			show_admin_fatal('There was a problem emailing a request recieved PDF to ' + request.user.email + ' for <a href="#requests/' + request.id + '">' + request.name + '</a>. Please manually send email to customer and report issue to support.')
		end
		
	end


	# Move me to user model?
	def show_admin_fatal(msg, identifier = nil)
		User.find_each(:'$or' => [{:user_type => 'admin'}, {:user_type => 'staff'}]) do |user| 

			show_fatal_alert = true

			# Don't show alert if there's already one being displayed of the same type
			unless identifier.nil?
				user.events.each do |ev|
					if ev.event_object.to_model.is_a?(DashboardAlert) && ev.event_object.unique_identifier == identifier && !ev.delivered 
						show_fatal_alert = false
					end
				end
			end

			if show_fatal_alert
				event = Event.new(:persist => true)
				event.event_object = DashboardAlert.new(:message => msg, :level => 'error', :unique_identifier => identifier)
				user.events << event
				user.save
			end
		end
	end

	# Move me to user model?
	def dismiss_ilab_errors()
		User.find_each(:'$or' => [{:user_type => 'admin'}, {:user_type => 'staff'}]) do |user| 

			user.events.each do |ev|
				if ev.event_object.to_model.is_a?(DashboardAlert) && ev.event_object.unique_identifier == 'ilab-api-connection-error' && !ev.delivered 
					ev.destroy
				end
			end

		end
	end


	def import_requests

		#puts 'Starting request import'


		ilab_client = ILab::API.new(
			:version => 1,
			:debug => false,
			:auth => 'ydzsB7jvno0YKzUomost+qtdiVqVLAmA/9+P4f0XN7c9qExI4w8wTsy4PeTVRakuplnvS9eW53LgdTpWNDOKCA=='
		)

		#puts 'Querying iLab API'

		begin
			ilab_client.cores.find('ICBR Sanger Sequencing').service_requests.each do |r|

				# puts r['name'] +  ": " + r['state']

				# Make sure the request has been approved/started
				next if r['state'] != 'processing' && r['state'] != 'financials_approved' && r['state'] != 'researcher_in_agreement' && r['state'] != 'proposed'

				# Make sure the request has form data
				next if r.custom_forms.empty?

				submission = r.custom_forms.all[0].to_hash

				# Endure we're importing the correct type of request
				next unless submission['name'] == 'DNA Sequencing Request'

				# If the request has been deleted skip over
				next unless RecycleBin.all(:ilab_id => r['id'].to_i)[0].nil? && Request.where(:ilab_id => r['id'].to_i, :deleted => true).count == 0
				
				db_request = Request.all(:ilab_id => r['id'].to_i)[0]

				#puts 'got request'

				case r['state']

					when 'processing' # Re import request
						
						if db_request.nil?
							db_request = Request.new
						else
							# Make sure we haven't already re imported this request
							next if db_request.begun
						end

						puts 'Updating request ' + r['name']
						
						# reimport and save record here
						db_request.attributes = ilab_submission_to_hash(r, ilab_client)
						db_request.save

						pdf_content = generate_pdf(db_request, '../../../data-mount/requests/' + r['name'])

						send_request_email(db_request, pdf_content, true)

						puts 'Milestone "Request Initiated" updated'
						
						db_request.begun = true
						db_request.save

						milestone = r.milestones.find('Request Initiated')

						now = Time.now.iso8601
						milestone.update(milestone.to_hash.merge({
							'started_on' => now,
							'completed_on' => now
						}))


					when 'financials_approved', 'researcher_in_agreement', 'proposed' # Import initial request 
						
						# Make sure the request hasn't already been imported
						next unless db_request.nil?

						puts 'Creating request ' + r['name']

						new_request = Request.create(ilab_submission_to_hash(r, ilab_client))

						# Generate, attach pdf to request
						pdf_content = generate_pdf(new_request, '../../../data-mount/requests/' + r['name']) #FIXME 

						# send email
						send_request_email(new_request, pdf_content)

						puts 'Created request: ' + new_request.to_s
				end

			end

			# if we make it here, we should delete the iLab error alerts since the API is now functional
			# logs are still stored in
			dismiss_ilab_errors
			
		rescue Timeout::Error, Errno::EINVAL, Errno::ECONNRESET, Errno::ETIMEDOUT, EOFError, Net::HTTPBadResponse, Net::HTTPHeaderSyntaxError, Net::ProtocolError => e
			puts 'Error with iLab API'
			
			puts Time.now.to_s
			puts e.to_s
			puts e.backtrace

			show_admin_fatal 'There was a problem connecting to the iLab API at ' + Time.now.to_s + ', request import failed. Please contact support.', 'ilab-api-connection-error'
		end
	end




	every 1.hours do
		#purge_expired
	end

	every 1.minutes do
		#clean_db
	end

	every 1.minutes do
		import_requests
	end

end



def is_running?
	process_list = `ps aux | grep "[/]var/www/api/v1.0/cron/run_job.rb >> /var/log/sslims-cron.log"`

	ppids = /^\S+\s+(\d{3,5})/.match(process_list).captures

	ppids.each do |pid|
		return true if pid.to_i != Process.ppid
	end

	return false
end


# CronJob assumes this is run every minute unless specified otherwise
if !is_running?
	puts Time.now.to_s
	puts 'Running cron jobs'
	CronJobs.run 
else
	puts Time.now.to_s
	puts 'Skipping cron run, last process is still running'
end

