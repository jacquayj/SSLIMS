require 'nokogiri'
require 'securerandom'
require 'pathname'
require 'shellwords'

class Chromatogram

	class SVG

		def initialize(data, svg_lib_loc = nil)
			# Parse XML
			svg_xml = Nokogiri::XML(data)

			# Define namespace
			@namespace = {'svg' => 'http://www.w3.org/2000/svg'}
			@svg_lib_loc = svg_lib_loc

			# @base_url + '/js/src/libs/SVGPan.js'

			@all_chromatograms = []

			svg_xml.xpath('/document/svg:svg', @namespace).each do |svg|
				cleanup_graph(svg)
				@all_chromatograms.push(svg)
			end
			
		end

		def [](index)
			@all_chromatograms[index].to_s
		end

		def to_a
			@all_chromatograms
		end

		def to_s
			@all_chromatograms[0].to_s
		end

		private

		def cleanup_graph(svg)
			# Remove unnecessary attributes, these cause issues with the SVGPan JS library 
			svg.remove_attribute('version')
			svg.remove_attribute('width')
			svg.remove_attribute('height')
			svg.remove_attribute('viewBox')

			# Set xlink namespace of chromatogram
			svg['xmlns:xlink'] = 'http://www.w3.org/1999/xlink'

			# Wrap with viewport element for use with SVGPan, move chromatogram to top left
			svg.inner_html = '<g id="viewport" transform="matrix(0.7445570230484009,0,0,0.7445570230484009,-33.661389783192135,-26.127853914927982)"><g>' + svg.inner_html + '</g></g>'
			
			# Add SVGPan library to SVG
			if !@svg_lib_loc.nil?
				script = Nokogiri::XML::Node.new('script', svg)
				script['xlink:href'] = @svg_lib_loc
				svg.children.first.add_previous_sibling script
			end

			# Fix alignment of y-axis labels
			svg.xpath('./svg:g/svg:g/svg:g/svg:g[contains(@transform, \' 82 \')]', @namespace).each do |y_label|

				# Move up 28 pixels
				y_label['transform'] = y_label['transform'].gsub(/82 (.*)\)/) do |s|
					"82 #{($1.to_i + 28).to_s})"
				end

			end

			# Remove graph labels, this shouldn't be here if the parameters worked
			svg.xpath('./svg:g/svg:g/svg:g/svg:g[contains(., \'abiview\')]', @namespace).remove
			svg.xpath('./svg:g/svg:g/svg:g/svg:g[contains(., \'Signal\')]', @namespace).remove

			# Remove white background from SVG
			svg.xpath('./svg:g/svg:g/svg:rect', @namespace).remove
		end

	end


	def initialize(opts)

		# Default options
		@options = {
			path: nil,
			data: nil,
			chromatogram_size: 40,
			graph_title: nil,
			graph_subtitle: nil,
			graph_description: nil,
			graph_xtitle: nil,
			graph_ytitle: nil
		}.merge(opts)

		if @options[:data].nil?
			read_ab1_file 
		else
			@size = @options[:data].length
		end
	end

	def fasta
		# Generate FASTA
		@fasta_contents ||= (">#{name}\n" + seq.scan(/.{1,70}/).join("\n"))
	end

	def edited_fasta
		# Generate FASTA
		@edited_fasta_contents ||= (">#{name}\n" + edited_seq.scan(/.{1,70}/).join("\n"))
	end

	def svg
		@svg ||= SVG.new(abiview_parse)
	end

	def seq
		@seq ||= get_tag('PBAS', 2)
	end

	def edited_seq
		@edited_seq ||= get_tag('PBAS', 1)
	end

	def size
		@size
	end

	def data
		@options[:data]
	end

	def name
		@name ||= get_tag('SMPL', 1)
	end

	def comment
		@comment ||= get_tag('CMNT', 1)
	end

	def is_edited?
		(seq != edited_seq)
	end

	private

	def get_tag(name, index)
		python_script = IO.popen("python #{File.dirname(__FILE__)}/extract_ab1_tag.py #{size} #{name.shellescape} #{index.to_i}", "w+")
		python_script.puts @options[:data]
		python_script.close_write
		out = python_script.gets.strip

		python_script.close_read unless python_script.closed?

		# Remove special characters
		cleaned = ""
		out.each_byte { |x| cleaned << x if (x > 31 && x < 127) }
		cleaned 
	end

	def read_ab1_file
		@size = File.size(@options[:path])
		@options[:data] = File.read(@options[:path])
	end

	def abiview_parse

		# Create tmp directory
		@tmp_dir = '/tmp/svg_' + SecureRandom.hex
		Dir.mkdir @tmp_dir

		@abi_file = SecureRandom.hex
		
		if @options[:path].nil?
			@options[:path] = @tmp_dir + "/#{@abi_file}.ab1"
			
			File.open(@options[:path], 'w') { |file| file.write(@options[:data]) }
		end

		# Throw error if abiview fails
		raise 'Error parsing ab1 file.' if !system(build_command)

		# Read result into memory
		#@fasta_contents = File.read(@tmp_dir + "/#{@abi_file}.fasta")
		svg_contents = File.read(@tmp_dir + "/#{@abi_file}.svg")

		# Clean up time
		system "rm -rf #{@tmp_dir}"

		svg_contents
	end

	def build_command
		command = "/usr/local/bin/abiview -infile #{@options[:path].shellescape} -graph svg -outseq #{@tmp_dir}/#{@abi_file}.fasta -goutfile #{@tmp_dir}/#{@abi_file}"

		command += " -gtitle #{@options[:graph_title].shellescape}" if !@options[:graph_title].nil?
		command += " -gsubtitle #{@options[:graph_subtitle].shellescape}" if !@options[:graph_subtitle].nil?
		command += " -gxtitle #{@options[:graph_xtitle].shellescape}" if !@options[:graph_xtitle].nil?
		command += " -gytitle #{@options[:graph_ytitle].shellescape}" if !@options[:graph_ytitle].nil?
		command += " -window '#{@options[:chromatogram_size].to_i}'" if !@options[:chromatogram_size].nil?

		command += " > /dev/null 2>&1"

		command
	end

end
