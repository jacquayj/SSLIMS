require 'listen'

OUTPUT = '../sslims.min.js'

COMPILE_LIST = [
	'libs/jquery-2.1.0',
	'libs/underscore-1.5.0',
	'libs/backbone-1.1.0',
	'libs/sha256',
	'libs/base64',
	'libs/backbone.sync',
	'helpers',
	'router',
	'models',
	'views/login',
	'views/request_account',
	'views/dashboard',
	'views/table'
]

Dir.chdir './web/public/js/src'

listener = Listen.to('./', ignore: Regexp.new(OUTPUT, true)) do |modified, added, removed|

	if modified.length > 0
		puts 'Compiling...'

		command = 'uglifyjs '
		
		COMPILE_LIST.each do |js_file|
			command << (js_file + '.js ')
		end

		command << "-o #{OUTPUT} -p 5 -c -m"

		
		system command


		system "osascript -e \"beep 2\""
	end
end

listener.start

sleep
