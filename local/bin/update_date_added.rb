require 'nokogiri'

OLD_RECORDBOX_XML = '/Users/csquared/Music/DJ/rekordbox/recordbox_old.xml';
RECORDBOX_XML = '/Users/csquared/Music/DJ/rekordbox/recordbox.xml';
NEW_RECORDBOX_XML = '/Users/csquared/Music/DJ/rekordbox/recordbox_new.xml';

doc = Nokogiri::XML(File.read(RECORDBOX_XML))
old_doc = Nokogiri::XML(File.read(OLD_RECORDBOX_XML))

doc.xpath('//DJ_PLAYLISTS/COLLECTION/TRACK').each do |track|
  # get name from new track
  name = track['Name']

  # use xpath to search for name in old xml
  old_track = 
    old_doc.xpath('//DJ_PLAYLISTS/COLLECTION/TRACK[contains(@Name, "' + name[0..20] + '")]').first
  
  # if we found it, update the date added
  if old_track
    puts "Matched: #{name}"
    track['DateAdded'] = old_track['DateAdded']
  else
    puts "NO Match: #{name}"
  end
end

# Write to new file
File.write(NEW_RECORDBOX_XML, doc)
