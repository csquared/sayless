require 'fileutils'
Dir['*.mp3'].each do |file|
  chunks = file.split('-')
  if chunks.size == 5
    if chunks[2].size == 4
      newname = [chunks[0], chunks[1], chunks[3], chunks[4]].join('-')
      FileUtils.mv(file,newname) 
    end
  end
end
