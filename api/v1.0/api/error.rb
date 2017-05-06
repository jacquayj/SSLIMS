require 'time'

class APIError < StandardError
	attr_reader :code, :err

	def initialize(code, err = false)
		@code = code
		@err = err

		showMsg = self.err || self.message

		puts Time.now.to_s + ": " + showMsg
	end
end