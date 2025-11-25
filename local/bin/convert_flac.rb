Dir['**/*.flac'].each do |file|
  outfile = file.gsub(/flac$/, 'm4a')
  File.delete(outfile) if File.exist?(outfile)
  command = "ffmpeg -i '#{file}'  -c:v copy '#{outfile}'"
  #puts command
  system(command)
end
