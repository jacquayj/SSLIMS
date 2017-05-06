require 'digest/sha1'

# Helper class for the user
class APIUser

	# Constructor for user object, pass in the data required for db access and authentication
	def initialize(request, params, path, config, cookies)
		@req = request
		@path = path
		@params = params
		@config = config
		@cookies = cookies


		# Does the auth header exist?
		if !@req.env['HTTP_X_SSLIMS_AUTH'].nil?

			# Init header hash
			header = {}

			# Extract username, timestamp, and signature from header
			header[:email], header[:timestamp], header[:signature] = @req.env['HTTP_X_SSLIMS_AUTH'].split(':')

			# Check if it's valid
			@auth = valid_signature?(header)

		elsif @params[:auth]

			q = {'$and' => [
				# Ensure the user wasn't deleted
				{'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] },
				{:client_api_key => @params[:auth]}
			]}

			@user_data = User.all(q)[0]

			@auth = !@user_data.nil?

		elsif !@cookies[:sslims_auth].nil?
			
			q = {'$and' => [
				# Ensure the user wasn't deleted
				{'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] },
				{:client_api_key => @cookies[:sslims_auth]}
			]}

			@user_data = User.all(q)[0]

			@auth = !@user_data.nil?

		elsif !@params['auth_token'].nil?

			@auth = valid_token?

		else
			@auth = true

			@user_data = {'_id' => nil, 'user_type' => 'guest'}
		end

	end

	def valid_token?
		@token = AuthToken.where(:token => @params['auth_token']).all[0]

		# No token found
		return false if @token.nil?

		# Delete token and return false if token is older than 24 hours
		if @token.created_at < (DateTime.now - 86400)
			use_token
			return false
		end

		# Should we query for non-deleted users here?

		@user_data = User.find(@token.user_id)

		return true
	end

	def use_token

		if !@token.nil?

			# Recycle the data because we love earth
			RecycleBin.new(@token.serializable_hash.merge({'_collection_name' => @token.class.collection_name})).save

			# Delete record
			@token.destroy

		end
	end

	# Checks to see if the request contains a valid signature
	def valid_signature?(auth)

		q = {'$and' => [
			{'$or' => [{'deleted' => {'$exists' => false}}, {'deleted' => false}] },
			{:email => auth[:email]}
		]}

		# Find user in database
		@user_data = User.all(q)[0]

		# Not valid if user doesn't exist
		return false if @user_data.nil?

		# Hash payload for use in calculated signature
		sha2_data = (Digest::SHA2.new << @req.body.read).to_s

		# Get current timestamp for use in calculated signature
		current_timestamp = Time.now.to_i

		sig_matches = ((auth[:signature] == (Digest::SHA2.new << "#{@req.request_method}.#{@path + @req.query_string}.#{sha2_data}.#{auth[:timestamp]}.#{@user_data['client_api_key']}").to_s) || 
		
		# If there isn't anything after the ? in the url, rack/sinatra doesn't report a query string
		(auth[:signature] == (Digest::SHA2.new << "#{@req.request_method}.#{@path}?.#{sha2_data}.#{auth[:timestamp]}.#{@user_data['client_api_key']}").to_s))


		# Was the request formed in the last 5 minutes? Does the calculated signature match?
		return ((auth[:timestamp].to_i >= (current_timestamp - 600)) && (auth[:timestamp].to_i <= (current_timestamp + 600))) && sig_matches
	end

	# Let user object act as hash to access db data
	def [](key)
		@user_data.reload if @user_data.class == User
		@user_data[key]
	end

	# Can the user perform the specific action on the resource?
	def allowed_to?(action, resource)
		begin
			return (@config['permissions'][@user_data['user_type']][resource][action] == false) ? false : true
		rescue
			return false
		end	
	end

	# Has the user authenticated?
	def authenticated?
		@auth
	end

	def is_guest?
		@user_data['user_type'] == 'guest'
	end


end