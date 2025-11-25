#!/usr/bin/env ruby
require 'httparty'
require 'open3'
require 'fileutils'

def download_album_art(url, filename)
  response = HTTParty.get(url)

  if response.code == 200
    File.open(filename, 'wb') do |file|
      file.write(response.body)
    end
  else
    raise "Error downloading album art: #{response.code} #{response.message}"
  end
end

def convert_and_embed_art(wav_path, album_art_path)
  output_filename = File.basename(wav_path, '.wav') + '.mp3'

  cmd = "ffmpeg -i '#{wav_path}' -i '#{album_art_path}' -map 0:a -map 1:0 -c:v copy -b:a 320k '#{output_filename}'"
  #cmd = "ffmpeg -i '#{wav_path}' -i '#{album_art_path}' -map 0 -map 1 -c:v copy -c:a pcm_s16be -id3v2_version 3 -metadata:s:v title='Album cover' -metadata:s:v comment='Cover (front)' '#{output_filename}'"
  Open3.popen3(cmd) do |stdin, stdout, stderr, wait_thr|
    exit_status = wait_thr.value
    unless exit_status.success?
      raise "Error executing FFmpeg command: #{stderr.read.strip}"
    end
  end

  output_filename
end

if ARGV.size != 2
  puts "Usage: ruby convert_and_embed_art.rb [WAV_FILE_PATH] [ALBUM_ART_URL]"
  exit 1
end

wav_file_path = ARGV[0]
album_art_url = ARGV[1]
album_art_path = 'album_art_temp.jpg'

begin
  puts "Downloading album art..."
  download_album_art(album_art_url, album_art_path)

  puts "Converting WAV to MP3 and embedding album art..."
  output_filename = convert_and_embed_art(wav_file_path, album_art_path)
  puts "Conversion complete. Output file: #{output_filename}"
ensure
  FileUtils.rm_f(album_art_path)
end
