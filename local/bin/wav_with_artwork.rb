source_file = ARGV[0]
image_file  = ARGV[1]

if ARGV[0] == '' or ARGV[1] == ''
  puts "Required inputs: <wav file> <image file>"
  exit 0
end

outfile = ARGV[2] || source_file.gsub(/wav$/i, 'mp3')
command = "ffmpeg -i '#{source_file}' -i '#{image_file}' -map 0:a -map 1:0 -c:v copy -b:a 320k '#{outfile}'"

puts(command)
exec(command)
