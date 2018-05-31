#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!


def getTotalDays()
	stats_days = DescriptiveStatistics::Stats.new(Procedure.all.pluck(:days))
	q1 = stats_days.value_from_percentile(20).to_s
	q2 = stats_days.value_from_percentile(40).to_s
	q3 = stats_days.value_from_percentile(60).to_s
	q4 = stats_days.value_from_percentile(80).to_s
	days = [{"id" => "20", "text" => "0 até " + q1 + " dia(s)"},
			{"id" => "40", "text" => q1 + " dia(s) até " + q2 + " dia(s)"},
			{"id" => "60", "text" => q2 + " dia(s) até " + q3 + " dia(s)"},
			{"id" => "80", "text" => q3 + " dia(s) até " + q4 + " dia(s)"},
			{"id" => "100", "text" => q4 + "+ dia(s)"}]
	return days
end

def main()
	total_days_array = getTotalDays()
	puts('Save json file with results')
	fJson = File.open(Rails.root.join('public/total_days.json'), "w")
	fJson.write(total_days_array.to_json)
	fJson.close()
end

main()