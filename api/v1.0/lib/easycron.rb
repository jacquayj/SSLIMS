require 'date'

class Integer

	def minutes
		{:type => :minutes, :value => self}
	end

	def hours
		{:type => :hours, :value => self}
	end

	def days
		{:type => :days, :value => self}
	end

end

class EasyCron

	class << self

		# Static class varaible that stores jobs
		@@jobs = {}

		now = DateTime.now
		date = now.to_date

		offset_hour = "-" + Time.now.strftime("%z")[2]

		@@current_datetime = DateTime.new(date.year, date.month, date.day, now.strftime('%k').to_i, now.strftime('%M').to_i, 0, offset_hour)


		def days_in_current_month
			date = @@current_datetime.to_date

			(Date.new(date.year, 12, 31) << (12 - date.month)).day
		end

		# Returns array of DateTimes for when a callback should run
		def get_run_times(time_period)
			run_times = []

			current_date = @@current_datetime.to_date
			current_time = @@current_datetime.to_time

			current_offset = (current_time.utc_offset / 60 / 60).to_s

			case time_period[:type]
				when :minutes
					num_runs_this_hour = (60 / time_period[:value].to_f).floor

					num_runs_this_hour.times do |n|
						minute = (n * time_period[:value])

						run_times.push(DateTime.new(current_date.year, current_date.month, current_date.day, current_time.hour, minute, 0, current_offset))
					end
				when :hours
					num_runs_today = (24 / time_period[:value].to_f).floor

					num_runs_today.times do |n|
						hour = (n * time_period[:value])

						run_times.push(DateTime.new(current_date.year, current_date.month, current_date.day, hour, 0, 0, current_offset))
					end
				when :days
					# Can include the last day, so use ceil
					num_runs_this_month = (days_in_current_month / time_period[:value].to_f).ceil

					num_runs_this_month.times do |n|
						day = (n * time_period[:value]) + 1

						run_times.push(DateTime.new(current_date.year, current_date.month, day, 0, 0, 0, current_offset))
					end

			end

			return run_times
		end

		# Method called by crontab, runs time period callbacks
		def run
			@@jobs.each do |class_obj, jobs|
				instance = class_obj.new

				current_datetime_str = @@current_datetime.to_s

				jobs.each do |job|
					run_times = get_run_times job[:time_period]

					match = !(run_times.index do |date_time|
						current_datetime_str == date_time.to_s
					end).nil?

					instance.instance_eval(&job[:callback]) if match
				end
			end
		end

		# Registers a job
		def every(time_period, &callback)

			# Init array if needed to contain time period callbacks for a job
			@@jobs[self] ||= []

			@@jobs[self].push({
				:time_period => time_period,
				:callback => callback,
				:name => self.name
			})
		end
	end

end