require 'net/http'
require 'json'
require 'forwardable'

# Begin ILab namespace
module ILab

	# Abstration for REST API collection
	class Collection

		include Enumerable
  		extend Forwardable

  		def_delegators :@data, :each, :[]

		# Used by child items to get base url
		attr_accessor :url, :name

		def initialize(name, parent, api)
			@name = name
			@parent = parent
			@api = api
			@data = nil

			@url = @parent.url + '/' + @name

			# Request data via HTTP and load into memory
			load_data
		end

		# Returns child item by name or id attribute
		def find(identifier)

			# Was a string passed in?
			if identifier.class == String 

				# Return first match on name attribute
				return (@data.select { |item| item.name == identifier })[0]

			# Was an int passed in?
			elsif identifier.class == Integer

				# Return first match on id attribute
				return (@data.select { |item| item.id == identifier })[0]
			end
		end

		# Returns all child item objects
		def all
			@data
		end

		# Convert array to string
		def to_s
			"#{@name}(#{@data.length})"
		end

		def empty?
			@data.nil? || @data.empty?
		end

		private

		# Generates URL from parent, requests data via HTTP, returns array of item objects
		def load_data

			r = @api.http_request(:url => @url)['ilab_response']

			if r.nil?
				@data = nil
			else
				
				meta = r['ilab_metadata'].clone
				r.delete 'ilab_metadata'

				@data = r.values.first.map { |item| Item.new(item, self, @api) }
				
				unless meta.empty?

					# Do we have more pages to request?
					while !meta['next_page'].nil? && meta['next_page'] <= meta['total_pages']

						r = @api.http_request(:url => @url, :page => meta['next_page'])['ilab_response']
						
						meta = r['ilab_metadata'].clone
						r.delete 'ilab_metadata'

						@data.concat(r.values.first.map { |item| Item.new(item, self, @api) })
					end
				end
				
			end
		end

	end

	class Item

		attr_accessor :url, :type

		# Sets instance variables, generates URL from parent
		def initialize(data, parent, api)
			@data = data
			@parent = parent
			@api = api
			@actions = {
				:GET => {},
				:POST => {}
			}

			@url = parent.url + '/' + self.id.to_s
			@type = parent.name.chomp('s')
		end

		# When any method of this object is called, return the data from internal hash or create new collection if it's an action
		def method_missing(m, *args, &block)
			method_name = m.to_s

			if @data.has_key? 'actions'
				# Get the action
				get_action = @data['actions']['list_' + method_name]

				# Does it actually exist?
				if !get_action.nil?

					# Extract collection name from URL
					name = /\/([a-z_]+)\.(xml|json)$/.match(get_action['url'])[1]

					# Create new collection if it doesn't already exist
					return @actions[:GET][name] ||= Collection.new(name, self, @api)
				end
			end

			if method_name[0..5] == 'create'
				post_action = @data['actions'][method_name]

				if !post_action.nil?

					# Extract collection name from URL
					name = /\/([a-z_]+)\.(xml|json)$/.match(post_action['url'])[1]

					post_url = @url + '/' + name

					return @api.http_request(:url => post_url, :type => :POST, :payload => {name.to_sym => args.first})
				end
			end

			# Return data if it exists in the internal hash
			return @data[method_name] if !@data[method_name].nil?

			return nil
		end

		def delete

		end

		def to_hash
			@data
		end

		def update(new_data)
			return @api.http_request(:url => @url, :type => :PUT, :payload => {@type.to_sym => new_data})
		end

		def [](index)
			@data[index]
		end

		# Return the data as a string
		def to_s
			@data.to_s
		end

	end

	class API

		attr_accessor :url

		def initialize(opts)
			@options = {
				:version => 1,
				:auth => nil
			}.merge(opts)

			@url = "https://api.ilabsolutions.com/v#{@options[:version]}"
		end

		def cores
			@cores ||= Collection.new('cores', self, self)
		end

		def http_request(opts)
			opts = {
				:url => nil,
				:type => :GET,
				:payload => nil,
				:json => true,
				:page => nil
			}.merge(opts)
			
			url = opts[:json] ? (opts[:url] + '.json') : opts[:url]
			
			unless opts[:page].nil?
				url += "?page=#{opts[:page].to_s}"
			end

			uri = URI(url)

			http = Net::HTTP.new(uri.host, uri.port)

			http.use_ssl = (uri.scheme == 'https')
			http.set_debug_output $stderr if @options[:debug]

			http.start do |http|
				case opts[:type]

					when :GET
						request = Net::HTTP::Get.new uri
					when :POST
						request = Net::HTTP::Post.new uri
						request['Content-Type'] = 'application/json'
						request.body = JSON.generate(opts[:payload])
					when :PUT
						request = Net::HTTP::Put.new uri
						request['Content-Type'] = 'application/json'
						request.body = JSON.generate(opts[:payload])
				end

				request['Authorization'] = 'bearer ' + @options[:auth]
				request['Accept-Encoding'] = 'identity'

				response = http.request(request)

				return opts[:json] ? JSON.parse(response.body) : response.body
			end
		end

	end

end
