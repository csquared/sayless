
Dir['*.m4a'].each do |file|
  puts file
  outfile = file.gsub(/m4a/, 'mp3')
  File.delete(outfile) if File.exists?(outfile)
  command = "ffmpeg -i '#{file}' -ar 44100 -ac 2 -b:a 320 -c:v copy '#{outfile}'"
  puts command
  system(command)
  File.delete(file)
end
