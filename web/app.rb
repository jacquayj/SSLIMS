require 'sinatra/base'
require 'active_support'
require 'mongo_mapper'
require 'base64'
require 'json'
require 'net/http'
require 'digest/sha2'
require 'cgi'
require 'uglifier'
require 'tilt/erb'

require_relative '../api/v1.0/lib/chromatogram'
require_relative '../api/v1.0/models/init'

class SSLIMS < Sinatra::Base

	enable :sessions

	# Runs once on startup
	configure do

		# Load config file into memory
		set :config, eval(File.read(File.dirname(__FILE__) + '/settings.rb'))

		# Setup MongoMapper ORM
		MongoMapper.connection = Mongo::Connection.new(settings.config['database']['hostname'])
		MongoMapper.database = settings.config['database']['name']
		MongoMapper.connection[settings.config['database']['name']].authenticate(settings.config['database']['username'], settings.config['database']['password'])

	end

	helpers do

		def compile_js(files)
			contents = ''
			files.each do |f|
				contents << File.read('public/' + f) + "\n\n"
			end
			
			#Uglifier.compile(contents)

			contents
		end

	end

	# Used by JS client to see if the shib session is still valid
	get '/verify-shib' do
		content_type 'application/json'
		'true'
	end

	get '/auth' do
		
		user = User.where('$and' => [{:client_api_key => session[:auth_key]}, {'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] }]).first

		@disabled = false
		@valid_account = false

		# Does this user exist?
		if !user.nil?
			if user.status == 'disabled'
				@disabled = true

				user.client_api_key = ''
			else
				@valid_account = true
			end

			user['url_auth'] = true

			@user = user.to_json

			erb :application
		else
			redirect to('/')
		end

	end

	get '/auth/:auth_key' do 
		session[:auth_key] = params[:auth_key]
		redirect to('/auth')
	end

	get '/app.js' do
		content_type 'application/javascript'
		cache_control :public, :max_age => 31536000

		@@compiled_js ||= {
			:last_modified => Time.now,
			:content => compile_js([
				'js/src/globals.js',

				'js/src/libs/jquery-2.1.0.js',
				'js/src/libs/underscore-1.5.0.js',
				'js/src/libs/backbone-1.1.0.js',
				'js/src/libs/sha256.js',
				'js/src/libs/md5.js',
				'js/src/libs/base64.js',
				'js/src/libs/backbone.extend.js',
				'js/src/libs/html5-qrcode.min.js',
			
				'js/src/helpers.js',
				'js/src/router.js',
				'js/src/models.js',

				'js/src/views/dashboard.js',
				'js/src/views/login.js',
				'js/src/views/table.js',
				'js/src/views/sample_sheet.js',
				'js/src/views/request_account.js'
			])
		}

		last_modified @@compiled_js[:last_modified]

		@@compiled_js[:content]
	end

	get '/' do

		# If we get here, shib auth was a success
		# Lookup user's API key based on request.env['REMOTE_USER']
		# Deliver API key via template to SSLIMS.init();

		shib_user = User.where('$and' => [{:email => request.env['REMOTE_USER']}, {'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] }]).first

		@disabled = false
		@valid_account = false
			
		# Does this user exist?
		if !shib_user.nil?
			if shib_user.status == 'disabled'
				@disabled = true

				shib_user.client_api_key = ''
			else
				@valid_account = true
			end

			@user = shib_user.to_json
		else
			# No, use the shib data
			user_hash = {
				:email => request.env['REMOTE_USER'],
				:firstName => request.env['givenName'],
				:lastName => request.env['sn']
			}

			@user = JSON.generate(user_hash)
		end

		erb :application
		
	end


end
