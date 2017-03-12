#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def get_procedures_by_date
  result = []
  procedure_by_years = Procedure.all.group_by {|p|  p.date.year }

  years = procedure_by_years.keys.sort

  years.each do |year|
    procedure_by_months = procedure_by_years[year].group_by{|p| p.date.month }
    months = procedure_by_months.keys.sort
    months.each do |month|
      result << [ year, month, procedure_by_months[month].count]
    end
  end
  result
end

def main()
  procedures = get_procedures_by_date

  fJson = File.open("public/procedures_by_date.json","w")
  fJson.write(procedures.to_json)
  fJson.close()
end

main()
