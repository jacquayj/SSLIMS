# Load SSLIMS API
require './v1.0/app'

map '/v1.0' do
	run API_v1.new
end
