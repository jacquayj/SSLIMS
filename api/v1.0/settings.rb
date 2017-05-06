{
	"api_version" => "v1.0",
	"database" => {
		"type" => "mongo",
		"hostname" => "127.0.0.1",
		"port" => 27017,
		"name" => "sslims",
		"username" => "sslims",
		"password" => "kQHG8cC5A5KhWDH6"
	},
	"smtp" => {
		"host" => "smtp.ufl.edu",
		"port" => 25,
		"sender" => {
			"name" => "SSLIMS Admin",
			"email" => "sshanker@ufl.edu"
		}
	},
	"run_data_path" => "/var/www/sslims/data-mount",
	"resources" => { # Global permissions
		"auth_token" => {
			"model" => AuthToken,
			"POST" => {
				"before" => lambda { |params|

					request_data = params[:data].clone

					user = User.where(:$or => [
						{:username => request_data['user']},
						{:email => request_data['user']}
					]).all[0]

					raise APIError.new(404), "Unable to find user" if user.nil? 

					params[:data].clear

					params[:data]['user_id'] = user.id
					params[:data]['token'] = SecureRandom.hex

					case request_data['type']

						when 'password_reset'
							API_v1::email(
								:name => "#{user.first_name} #{user.last_name}",
								:email => user.email,
								:subject => 'SSLIMS Password Reset',
								:message => "Hello #{user.first_name},

We received a request to reset your password. Click here to enter your new password:
http://sslims.dev/#reset/#{user.id}/#{params[:data]['token']}

Thanks,
SSLIMS Admin
"
							)

					end

				},
				"after" => lambda { |result, content_type, download_filename, user|
					result.delete 'token'
					result
				}
			},
			"GET" => {
				"after" => lambda { |result, content_type, download_filename, user|
					result.delete 'token'
					result
				}
			},
			"PUT" => {
				"after" => lambda { |result, content_type, download_filename, user|
					result.delete 'token'
					result
				}
			},
			"DELETE" => {}
		},
		"events" => {
			"model" => Event,
			"POST" => {},
			"GET" => {
				"before" => lambda { |params|

					orig = params[:query].clone

					params[:query].replace({
						'$and' => [
							{'user_id' => params[:user]['_id']},
							orig
						]
					})

				}
			},
			"PUT" => {},
			"DELETE" => {}
		},
		"users" => {
			"model" => User,
			"POST" => {
				"before" => lambda { |params|
					data = params[:data]

					raise APIError.new(400, {
						:user_type => ['User type is required']
					}) if data['user_type'].nil?

					# Generate client API key when account is created
					data['client_api_key'] = SecureRandom.uuid

				}
			},
			"GET" => {
				"after" => lambda { |result, content_type, download_filename, user|
					# if user['user_type'] != 'admin' || 
					# if result.is_a?(Array)
					# 	result.each do |r|
					# 		r.delete 'client_api_key'
					# 	end
					# else
					# 	result.delete('client_api_key') if result.is_a?(Hash)
					# end

					result
				}
			},
			"PUT" => {
				"before" => lambda { |params|
					data = params[:data]
					user = params[:user]

					
					
				}
			},
			"DELETE" => {}
		},
		"requests" => {
			"model" => Request,
			"POST" => {
				
			},
			"GET" => {
				"after" => lambda { |result, content_type, download_filename, user|
					if result.is_a?(Hash)
						#result['photo']['data'] = Base64.encode64(File.read('../data/requests/' + result['name'].downcase + '/' + result['photo']['path']))
						#result['photo'].delete 'path'
					end
					
					result
				}
			},
			"PUT" => {},
			"DELETE" => {}
		},
		"samples" => {
			"model" => Sample,
			"POST" => {},
			"GET" => {},
			"PUT" => {
				"before" => lambda { |opts|
					
					s = Sample.find(opts[:params]['element_id'])

					if s.nil? || s.request.nil? || !s.request.begun 
						opts[:data].delete("status")
						raise APIError.new(400), "Cannot check-in samples for unbegun requests"
					end
					
				},
				"after" => lambda { |result, content_type, download_filename, user|
					is_complete = true

					@record.request.samples.each do |s|

						if s.status == 'Waiting to receive'
							is_complete = false
							
						end
					end 

					if is_complete
						r = Request.find(@record.request.id)
						r.complete = true
						r.save
					end

					result
				}
			},
			"DELETE" => {}
		},
		"options" => {
			"model" => Option,
			"POST" => {},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"primers" => {
			"model" => Primer,
			"POST" => {},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"sheets" => {
			"model" => Sheet,
			"POST" => {
				"before" => lambda { |opts|
					opts[:data]['user_id'] = opts[:user]['_id'].to_s
				},
				"after" => lambda { |result, content_type, download_filename, user|

					old_wells = result.delete('wells')
					result['wells'] = {}

					Thread.new do

						ilab_client = ILab::API.new(
							:version => 1,
							:debug => false,
							:auth => 'ydzsB7jvno0YKzUomost+qtdiVqVLAmA/9+P4f0XN7c9qExI4w8wTsy4PeTVRakuplnvS9eW53LgdTpWNDOKCA=='
						)
						sanger_sequencing = ilab_client.cores.find('ICBR Sanger Sequencing')
						now = Time.now.iso8601

						service_requests = sanger_sequencing.service_requests
						
						ilab_request_updates = {}
						old_wells.each do |key, value|
							sample = Sample.find(value)
							ilab_request_updates[sample.request.name] = true
						end

						threads = []
						ilab_request_updates.each do |key, value|
							threads.push(Thread.new do
								milestone = service_requests.find(key).milestones.find('Sequencing')
								milestone.update(milestone.to_hash.merge({
									'started_on' => now
								}))
							end)
						end

						threads.each { |t| t.join }
					end

					old_wells.each do |key, value|
						sample = Sample.find(value)

						sample.sheet_indexs[result['id'].to_s] = well_index_to_vert(key)
						sample.save

						# Get config
						config = result['wells_config'][key]
						config = Instrument.find(config) if !config.nil?

						result['wells'][well_index_to_name(key)] = {
							:sample => sample,
							:config => config
						}
					end

					sample_sheet = @options[:sinatra_app].erb(:sample_sheet, :locals => {:sheet => result, :record => @record})
					result['wells'] = old_wells 
					
					Thread.new do
						sample_sheet_file = FileDownload.new
						sample_sheet_file['sample_sheet'] = true
						sample_sheet_file.mime = 'text/tab-separated-values'

						sheet_filename = result['name'].downcase.gsub(/[^a-zA-Z0-9-]/, '-').gsub(/-+/, '-')

						sample_sheet_file.path = 'data-mount/sample_sheets/' + sheet_filename + '.plt'
						sample_sheet_file.save
						
						File.open('../' + sample_sheet_file.path, 'w') { |file| file.write(sample_sheet) }

						@record.plt_file = sample_sheet_file.id
						@record.save
						
					end
					
					generate_instrumentlog_pdf(@record)
					generate_reactionlog_pdf(@record)
					
					
					result
				}
			},
			"GET" => {},
			"PUT" => {
				"after" => lambda { |result, content_type, download_filename, user|

					old_wells = result.delete('wells')
					
					result['wells'] = {}


					old_wells.each do |key, value|
						sample = Sample.find(value)

						sample.sheet_indexs[result['id'].to_s] = well_index_to_vert(key)
						sample.save

						# Get config
						config = result['wells_config'][key]
						config = Instrument.find(config) if !config.nil?

						result['wells'][well_index_to_name(key)] = {
							:sample => sample,
							:config => config
						}
					end

					sample_sheet = @options[:sinatra_app].erb(:sample_sheet, :locals => {:sheet => result, :record => @record})
					result['wells'] = old_wells 

					Thread.new do
						sample_sheet_file = FileDownload.new
						sample_sheet_file['sample_sheet'] = true
						sample_sheet_file.mime = 'text/tab-separated-values'

						sheet_filename = result['name'].downcase.gsub(/[^a-zA-Z0-9-]/, '-').gsub(/-+/, '-')

						sample_sheet_file.path = 'data-mount/sample_sheets/' + sheet_filename + '.plt'
						sample_sheet_file.save

						File.open('../' + sample_sheet_file.path, 'w') { |file| file.write(sample_sheet) }

						old_plt = FileDownload.find(@record.plt_file)
						old_plt.destroy unless old_plt.nil?

						@record.plt_file = sample_sheet_file.id
						@record.save
					end

					generate_instrumentlog_pdf(@record)
					generate_reactionlog_pdf(@record)
					
					result
				}
			},
			"DELETE" => {}
		},
		"alert_templates" => {
			"model" => AlertTemplate,
			"POST" => {},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"emails" => {
			"model" => Email,
			"POST" => {
				"before" => lambda { |params|

					params[:data]['user_id'] = params[:user]['_id']

					begin
						mail = Mail.new do
							from "#{params[:settings]['smtp']['sender']['name']} <#{params[:settings]['smtp']['sender']['email']}>"
							#to "#{params[:user]['first_name']} #{params[:user]['last_name']} <#{params[:data]['recipient']}>"
							to "#{params[:data]['recipient']}"
							subject params[:data]['subject']
							body params[:data]['message']
							#add_file :filename => "#{request['name']}.pdf", :content => pdf_content
						end
						mail.deliver!
					rescue Exception => e
						raise APIError.new(400), "Error sending email to #{params[:data]['recipient']}" 
					end

				}
			},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"account_requests" => {
			"model" => AccountRequest,
			"POST" => {},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"comments" => {
			"model" => Comment,
			"POST" => {},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"runs" => {
			"model" => Run,
			"POST" => {},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
		"files" => {
			"model" => FileDownload,
			"POST" => {
				"after" => lambda { |result, content_type, download_filename, user|
					
					if !result['action'].nil?

						case result['action']['method']

							# Returns result of QR code, deletes file record
							when "scan_qr"
								file = @record

								photo_data = Base64.decode64(file.action['params']['photo_data'])

								tmp_loc = '/tmp/' + result['id'] + '.jpg'
								File.open(tmp_loc, 'w') { |file| file.write(photo_data) }

								begin
									scan_json = ZXing.decode(tmp_loc)
								rescue ZXing::UndecodableError => e
									raise APIError.new(404), 'Error decoding QR'
								end

								unless scan_json.nil?
									result['request_id'] = JSON.parse(scan_json)['id']
									
								else
									raise APIError.new(404), 'Unable to find request'
								end

								File.delete tmp_loc
								file.destroy
								result.delete('action')

							when "replace_chromatogram"
								# This action is used by the drag & drop uploader (sample sheet view)
								# Will only work with edited files

								file = @record

								begin
									upload_binary = Base64.decode64(file.action['paramz']['ab1_data'])
								rescue Exception => e
									file.destroy

									raise APIError.new(400), "Unable to parse payload"
								end
								
								chromatogram = Chromatogram.new({
									:data => upload_binary
								})

								sample_id, sheet_id = chromatogram.comment.split(' ').last(2)

								sample = Sample.find(sample_id)
								sheet = Sheet.find(sheet_id)

								# Validate the sample and sheet exists
								raise APIError.new(404), 'Unable to find related sample sheet and sample records for this request' if sample.nil? || sheet.nil?

								raise APIError.new(404), 'Unable to upload unedited ab1 files here' unless chromatogram.is_edited?

								existing_run = Run.first('$and' => [{:sheet_id => sheet.id}, {:sample_id => sample.id}])

								# Create new run if it didn't exist
								existing_run = Run.new if existing_run.nil?

								update_run_record(existing_run, chromatogram, sample, sheet, true)

								file.action = nil
								file.save

								result['sample_id'] = existing_run.sample.id
								result['run_id'] = existing_run.id

							when "upload_chromatogram"

								file = @record

								begin
									upload_binary = Base64.decode64(file.action['paramz']['ab1_data'])
								rescue Exception => e
									file.destroy

									raise APIError.new(400), "Unable to parse payload"
								end
								
								chromatogram = Chromatogram.new({
									:data => upload_binary
								})

								sample_id, sheet_id = chromatogram.comment.split(' ').last(2)

								sample = Sample.find(sample_id)
								sheet = Sheet.find(sheet_id)

								# Validate the sample and sheet exists
								raise APIError.new(404), 'Unable to find related sample sheet and sample records for this request' if sample.nil? || sheet.nil?

								new_run = Run.new
								update_run_record(new_run, chromatogram, sample, sheet)

								file.action = nil
								file.save

								result['success'] = true
								
						end

					end

					result
				}
			},
			"GET" => {
			 	"after" => lambda { |result, content_type, download_filename, user|
			 		content_type.replace result['mime']

			 		aid = result['id']

			 		request = Request.where(:$or => [{'combined_archive.zip' => aid}, {'ab1_archive.zip' => aid}, {'seq_archive.zip' => aid}, {'svg_archive.zip' => aid}]).first

			 		if request.nil?
			 			run = Run.where(:$or => [{:ab1_file => aid}, {:seq_file => aid}, {:edited_ab1_file => aid}, {:edited_seq_file => aid}]).first
			 			request = run.sample.request unless run.nil?
			 		end

			 		unless request.nil?

				 		if request.user.user_type == 'customer' # Need to change this to user.id validation instead of user type

				 			Thread.new do
					 			ilab_client = ILab::API.new(
									:version => 1,
									:debug => false,
									:auth => 'ydzsB7jvno0YKzUomost+qtdiVqVLAmA/9+P4f0XN7c9qExI4w8wTsy4PeTVRakuplnvS9eW53LgdTpWNDOKCA=='
								)

					 			sanger_sequencing = ilab_client.cores.find('ICBR Sanger Sequencing')

								now = Time.now.iso8601

								begin
									puts "updating milestone"

									milestone = sanger_sequencing.service_requests.find(request.name).milestones.find('Data Delivery')
									milestone.update(milestone.to_hash.merge({
										'started_on' => now,
										'completed_on' => now
									}))
								rescue Exception => e
									puts "Unable to update milestone for #{request.name}"
								end
							end
							
				 		end

				 	end

				 	unless result['sample_sheet'].nil?
				 		
				 		sheet = Sheet.where(:plt_file => result['id']).first

				 		unless sheet.nil?
							# Need to update samplesheet status here
							update_model(sheet, {'status': 'Sequencing initiated'}) if sheet.status != 'Sequencing complete' && !@options[:params][:client].nil?
							sheet.save
				 		end

				 	end


			 		if result['archive'].nil?
				 		download_filename.replace(result['path'].split('/').last)
				 		return File.read('../' + result['path'])
				 	else
				 		case result['mime']
				 			when 'application/zip'
						 		zip_file = Zip::OutputStream.write_buffer do |zio|
									result['files'].each do |filepath|
										filename = filepath.split('/').last

										zio.put_next_entry filename
										zio.write(File.read('../' + filepath))
									end
								end

								download_filename.replace(result['file_name'])

								zip_file.rewind
								return zip_file.read
				 		end
				 	end
			 	}
			},
			"PUT" => {},
			"DELETE" => {}
		},
		"instruments" => {
			"model" => Instrument,
			"POST" => {
				"after" => lambda { |result, content_type, download_filename, user|
					
					instrument = Instrument.find(result['id'])

					photo_data = Base64.decode64(instrument.photo_data)

					photo_file = FileDownload.new
			 		photo_file.mime = instrument.photo_mime
			 		photo_file.path = 'data-mount/instrument_photos/' + photo_file.id + '.plt'
			 		photo_file.save

			 		instrument.photo_file = photo_file.id

			 		File.open('../' + photo_file.path, 'w') { |file| file.write(photo_data) }

			 		instrument.photo_data = nil
			 		instrument.photo_mime = nil

			 		result.delete('photo_data')
			 		result.delete('photo_mime')

			 		instrument.save

			 		result
				}
			},
			"GET" => {},
			"PUT" => {},
			"DELETE" => {}
		},
	},
	# User level permissions
	"permissions" => {
		"admin" => {
			"users" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"events" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"customers" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"requests" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"samples" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"account_requests" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"alert_templates" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"emails" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"primers" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"comments" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"runs" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"files" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"instruments" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"sheets" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			}
		},
		"staff" => {
			"users" => {
				"POST" => {
					"before" => lambda { |params|
						data = params[:data]

						raise APIError.new(403), "You don't have permission to create #{data['user_type']} users." if data['user_type'] != "customer"
					}
				},
				"GET" => {

				},
				"PUT" => {
					"before" => lambda { |params|
						data = params[:data]
						user = params[:user]

						if (!data['user_type'].nil? && data['user_type'] != "customer") && data['id'] != user['_id'].to_s
							raise APIError.new(403), "You don't have permission to update users to type: #{data['user_type']} #{data['id']} #{user['_id']}" 
						end
					}
				},
				"DELETE" => {}
			},
			"events" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"requests" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"samples" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"account_requests" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"comments" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"runs" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"instruments" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"sheets" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"alert_templates" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"files" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"emails" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			}
		},
		"customer" => {
			"users" => {
				"POST" => false,
				"GET" => {},
				"PUT" => false,
				"DELETE" => false
			},
			# "emails" => { # 
			# 	"POST" => {},
			# 	"GET" => {},
			# 	"PUT" => {},
			# 	"DELETE" => {}
			# },
			"events" => {
				"POST" => false,
				"GET" => {},
				"PUT" => {},
				"DELETE" => false
			},
			"requests" => {
				"POST" => false,
				"GET" => {
					"before" => lambda { |params|
						params[:query]['user_id'] = params[:user]['_id']
					}
				},
				"PUT" => false,
				"DELETE" => false
			},
			"samples" => {
				"POST" => false,
				"GET" => {
					"before" => lambda { |params|
						params[:query]['$or'] = []

						Request.where(:user_id => params[:user]['_id']).all.each do |request|
							request.samples.each do |sample|
								params[:query]['$or'].push({'id' => sample.id})
							end
						end
						
					}
				},
				"PUT" => false,
				"DELETE" => false
			},
			"account_requests" => {
				"POST" => false,
				"GET" => {},
				"PUT" => false,
				"DELETE" => false
			},
			"comments" => {
				"POST" => false,
				"GET" => {},
				"PUT" => false,
				"DELETE" => false
			},
			"files" => {
				"POST" => false,
				"GET" => {},
				"PUT" => false,
				"DELETE" => false
			},
			"instruments" => {
				"POST" => false,
				"GET" => {},
				"PUT" => false,
				"DELETE" => false
			},
			"runs" => {
				"POST" => false,
				"GET" => {},
				"PUT" => false,
				"DELETE" => false
			}
		},
		"guest" => {
			"account_requests" => {
				"POST" => {
					"before" => lambda { |params|
						data = params[:data]

						filter_hash(data, [
							'email', 'first_name', 'last_name', 'message'
						])
					}
				},
				"GET" => {
					# RequestAccountView need to check to see if a request has already been submitted
					"before" => lambda { |params|
						query = params[:query]['$and'][0]

						# Filter out all fields except email
						query.replace({'email' => query['email']})

					}
				},
				"PUT" => false,
				"DELETE" => false
			},
			"users" => {
				"POST" => {
					"before" => lambda { |params|
						data = params[:data]

						# Data client will attempt to create user
						raise APIError.new(403), "You don't have permission to create #{data['user_type']} users." if data['user_type'] != "data_client"
					}
				},
				"GET" => false,
				"PUT" => false,
				"DELETE" => false
			}
		},
		"data_client" => {
			"users" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"events" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"customers" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"requests" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"samples" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"account_requests" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"alert_templates" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"emails" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"primers" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"comments" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"runs" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"files" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"instruments" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			},
			"sheets" => {
				"POST" => {},
				"GET" => {},
				"PUT" => {},
				"DELETE" => {}
			}
		}
	}
}