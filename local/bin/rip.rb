require 'fileutils'
source_file = ARGV[0]
dest_format = ARGV[1] || 'mp3' # default to mp3
source_dir  = File.absolute_path(File.dirname(source_file))

# input validation
supported_formats = ['mp3', 'aiff', 'wav']
if !supported_formats.include?(dest_format)
  puts "Format must be one of: #{supported_formats.join(', ')}"
  exit 1
end

# build command string w. format specific args
command = "ffmpeg -i \"#{source_file}\"" 
outfile = source_file.gsub(/flac$/, dest_format)

case dest_format
when 'mp3'
command << " -ar 44100 -ac 2 -b:a 320k"
when 'aiff'
  cover = File.join(source_dir, "cover.jpg")
  command << " -i \"#{cover}\" -map 0 -map 1 "
end

command << " -c:v copy \"#{outfile}\""

## execute command
puts command
File.delete(outfile) if File.exist?(outfile)
system(command)
#File.delete(source_file) if File.exist?(source_file)

FileUtils.mv(outfile, File.expand_path('~/Music/DJ/sourcing/'))
FileUtils.rm_rf(source_dir)
puts "ripped"
