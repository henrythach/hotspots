#!/usr/bin/env ruby

require 'date'
require 'mongoid'


# Description: A one-off script that parses the police report and
# inserts them into a MongoDB db in a collection called "incidents"
#
# Notes:
#
# It does NOT fetch the page from the website:
#
# http://www.quincyma.gov/Government/POLICE/HotSpots.cfm
#
# ... so you would have to copy and paste the text from the site, and
# sift through the incidents you want to save.
#
# I know, I know... pretty lame, but the site isn't updated often anyways.
# If this script ever needs to called often, then update it so.


Mongoid.load!('./mongoid.yml', :development)
class Incident
  include Mongoid::Document

  field :id, type: Integer
  field :date, type: Date
  field :type, type: String
  field :recorded, type: String
  field :callTaker, type: String
  field :disposition, type: String
  field :officer, type: String
  field :notes, type: String

end



file = File.read("./sample.txt")
incidents = []
file.split(/^[\*_]+$/).each do |incident|
    incident = incident.strip()
    if !incident.start_with? "Incident"
        next
    end

    id = incident.match(/^Incident #: (\d+)/)[1]
    date = incident.match(/Date: (\d{4})-(\d{1,2})-(\d{1,2}) (\d{2}):(\d{2}):(\d{2})/)
    type = incident.match(/Type: (.*)$/)[1]
    location = incident.match(/^Location: (.*)$/)[1]
    howRec = incident.match(/How Rec: ([\w ]*) Call Taker/).nil? ? "N/A" : incident.match(/How Rec: (\w*) Call Taker/)[1]
    callTaker = incident.match(/Call Taker: (\w*)/)[1]
    disposition = incident.match(/^Disposition: ([\w ]*) Officer:/)[1]
    officer = incident.match(/Officer: ([\w, ]*)$/).nil? ? "<null>" : incident.match(/Officer: ([\w, ]*)$/)[1]
    notes = incident.split("Notes:\n")[1]

    incidents << {
        id: id.to_i,
        date:  DateTime.new(date[1].to_i, date[2].to_i, date[3].to_i, date[4].to_i, date[5].to_i, date[6].to_i).mongoize,
        type: type,
        location: location,
        recorded: howRec,
        callTaker: callTaker,
        disposition: disposition,
        officer: officer,
        notes: notes.nil? ? "" : notes.strip()
    }

end

Incident.collection.insert(incidents)