require 'nokogiri'
require 'id3tag'
require 'uri'
require 'clipboard'

def parse_rekordbox_xml(file_path)
  File.open(file_path) { |f| Nokogiri::XML(f) }
end

def get_playlist_tracks(xml_doc, playlist_title)
  target_playlist = xml_doc.xpath("//NODE[@Name='#{playlist_title}']")
  return [] if target_playlist.empty?

  track_ids = target_playlist.xpath('./TRACK').map { |track| track['Key'] }
  track_ids.map { |id| xml_doc.xpath("//TRACK[@TrackID='#{id}']")[0]['Location'] }
end

def normalize_path(path)
  uri = URI.parse(path)
  decoded_path = URI.decode_www_form_component(uri.path)
  decoded_path.gsub!('\\', File::SEPARATOR) if File::ALT_SEPARATOR
  decoded_path
end


def read_id3_tags(track_path)
  ID3Tag.read(File.open(track_path, 'rb'))
end

def main(rekordbox_file, playlist_title)
  # Parse rekordbox.xml
  xml_doc = parse_rekordbox_xml(rekordbox_file)
  tracks = get_playlist_tracks(xml_doc, playlist_title)

  # Read and print ID3 tags
  tracks.each do |track_path|
    id3_tags = read_id3_tags(normalize_path(track_path))

    
    track_text = "#{id3_tags.artist} #{id3_tags.title}"
    Clipboard.copy(track_text)
    puts track_text
    puts "Press ENTER to continue..."
    $stdin.gets
  end
end


rekordbox_file = File.expand_path('~/Music/DJ/rekordbox/recordbox.xml')
playlist_title = ARGV[0] || 'REMIXES' # Use the first command-line argument or the default 'REMIXES'
main(rekordbox_file, playlist_title)
