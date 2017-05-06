require 'sinatra/base'
require 'sinatra/cookies'
require 'active_support'
require 'mongo_mapper'
require 'json'
require 'securerandom'
require 'net/smtp'
require 'base64'
require 'zxing'
require 'tilt/erb'
require 'pp'

require_relative 'models/init'

require_relative 'api/error'
require_relative 'api/user'
require_relative 'api/request'

require_relative 'lib/chromatogram'
require_relative 'lib/ilab'

class API_v1 < Sinatra::Base

	# Enable cookies
	helpers Sinatra::Cookies

	# Runs once on startup
	configure do

		# Load config file into memory
		set :config, eval(File.read(File.dirname(__FILE__) + '/settings.rb'))

		# Setup MongoMapper ORM
		MongoMapper.connection = Mongo::Connection.new(settings.config['database']['hostname'])
		MongoMapper.database = settings.config['database']['name']
		MongoMapper.connection[settings.config['database']['name']].authenticate(settings.config['database']['username'], settings.config['database']['password'])


	end

	# Runs before each request
	before do

		# Add CORS support
		headers({
			'Access-Control-Allow-Origin' => '*'
		})

		headers({
			'Access-Control-Allow-Credentials' => 'true',
			'Access-Control-Allow-Methods' => 'GET,PUT,POST,DELETE,OPTIONS',
			'Access-Control-Allow-Headers' => 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-SSLIMS-Auth',
			'Access-Control-Max-Age' => '1728000'
		}) if request.request_method == 'OPTIONS'

		# Preserve the real path for use in authentication later on
		@real_path = request.path + ((request.query_string == "") ? "" : "?")
	end

	# Combines all HTTP methods to use as a route
	def self.any(url, &block)
		get(url, &block)
		post(url, &block)
		put(url, &block)
		delete(url, &block)
	end

	# Add support for Firefox CORS
	options('*') {}

	# Handle all requests
	any('/:resource/?:element_id?/?') do

		# Create the user object, pass in the request and path information (used for authentication)
		user = APIUser.new(request, params, @real_path, settings.config, cookies)

		# Throw error if the user has incorrect auth (if no auth is provided, this will return true since user is a guest)
		user_error("Unauthorized: Please provide valid authentication header, cookie, or token", 401) if !user.authenticated?

		# Try to parse the request body if it exists
		begin
			request.body.rewind
			parsed_data = (request.request_method != "GET" && request.request_method != "DELETE") ? JSON.parse(request.body.read) : nil
		rescue
			user_error("Bad Request: Unable to parse JSON in request: #{request.body}", 400)
		end

		# Process and respond to request, if there are any exceptions raised, send error message to user
		begin
			req = APIRequest.new(:request => request, :params => params, :data => parsed_data, :settings => settings.config, :user => user, :sinatra_app => self)
		
			respond(req.process(response))
		rescue APIError => e
			user_error(e.err || e.message, e.code)
		end

	end

	
	helpers do

		def user_error(msg, code = 403)
			halt(code, JSON.pretty_generate(:api_version => settings.config['api_version'], :error => 1, :error_message => msg))
		end

		def respond(res)
			# Set response content-type header
			content_type res[:content_type]
			
			halt(200, res[:msg])
		end

		def email(opts)

			msgstr = %{From: #{settings.config['smtp']['sender']['name']} <#{settings.config['smtp']['sender']['email']}>
			To: #{opts[:name]} <#{opts[:email]}>
			Subject: #{opts[:subject]}

			#{opts[:message]}
			}

			Net::SMTP.start(settings.config['smtp']['host'], settings.config['smtp']['port']) do |smtp|
				smtp.send_message msgstr,
					settings.config['smtp']['sender']['email'],
					opts[:email]
			end

		end

		def well_index_to_name(index)
			index = index.to_i + 1
			row_index = (index / 12.to_f).ceil - 1
			rows = 'A'.upto('H').to_a

			item_index = 12 - (((row_index + 1) * 12) - index)

			rows[row_index] + item_index.to_s
		end

		def well_index_to_vert(index)
			index = index.to_i + 1
			
			row_index = (index / 12.to_f).ceil - 1
			col_index = 12 - (((row_index + 1) * 12) - index)

			new_index = ((col_index - 1) * 8) + row_index

			new_index + 1
		end

	end

	error Sinatra::NotFound do
		user_error "Not Found: Unknown route for /#{request.path_info}", 404
	end

end


