class EmailTemplate

	attr_accessor :subject, :template

	def initialize(subject, template)
		@subject = subject
		@template = template
	end

	def generate_email(vars)
		return {
			:subject => parse_template(subject, vars),
			:body => parse_template(template, vars)
		}
	end

	private

	def parse_template(templ, vars)
		templ.gsub(/\{\{([0-9a-zA-Z\._ ]+)\}\}/) do |match|
			get_hash_prop($1.strip.split('.'), vars)
		end
	end

	def get_hash_prop(prop_array, hash)
		if prop_array.length > 1
			prop = prop_array.shift

			return get_hash_prop(prop_array, hash[prop])
		else 
			return hash[prop_array[0]]
		end
				
	end

end