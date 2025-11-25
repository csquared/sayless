#!/usr/bin/env ruby
require 'fileutils'

def sanitize_filename(filename)
  # Replace accented characters
  replacements = {
    'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
    'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a',
    'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
    'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o',
    'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
    'ñ' => 'n', 'ç' => 'c'
  }
  
  result = filename.dup
  replacements.each do |accented, replacement|
    result.gsub!(accented, replacement)
  end
  
  # Fix truncated filenames (ending with -1.mp3 or similar)
  if result =~ /(-\d+)\.(mp3|aiff|aif)$/
    result.gsub!(/(-\d+)\.(mp3|aiff|aif)$/, '.\2')
  end
  
  result
end

def update_playlist(playlist_path, changes, dry_run = true)
  content = File.read(playlist_path)
  new_content = content.dup
  
  changes.each do |old_path, new_path|
    new_content.gsub!(old_path, new_path)
  end
  
  if new_content != content
    puts "Playlist would be updated with #{changes.size} changes" if dry_run
    File.write(playlist_path, new_content) unless dry_run
    return true
  end
  
  puts "No changes needed in playlist"
  false
end

def sanitize_problematic_files(collection_path, problem_files, dry_run = true)
  changes = {}
  
  problem_files.each do |relative_path|
    full_path = File.join(collection_path, relative_path)
    if File.exist?(full_path)
      dir = File.dirname(full_path)
      old_name = File.basename(full_path)
      new_name = sanitize_filename(old_name)
      
      if old_name != new_name
        old_full_path = full_path
        new_full_path = File.join(dir, new_name)
        
        puts "#{old_name} -> #{new_name}"
        
        unless dry_run
          FileUtils.mv(old_full_path, new_full_path)
        end
        
        # Store changes for playlist update
        old_rel_path = relative_path
        new_rel_path = File.join(File.dirname(relative_path), new_name)
        changes[old_full_path] = new_full_path
        changes[old_rel_path] = new_rel_path
      else
        puts "No change needed for: #{old_name}"
      end
    else
      puts "File not found: #{full_path}"
    end
  end
  
  changes
end

# Your problematic files
collection_base = "/Volumes/c2storage/DJ/collection2"
problem_files = [
  "Contents/UnknownArtist/UnknownAlbum/6A - 105 - Coria - Kabaluere (SAYLESS EDIT).mp3",
  "Contents/Marshall Jefferson, Maesic, Salomé Das/Life Is Simple (Move Your Body) (Extended Mix)/2A - 121 - Marshall Jefferson, Maesic, Salom.mp3",
  "Contents/MAXI MERAKI, Samm (BE)/Everybody Get Up/9A - 119 - MAXI MERAKI, Samm (BE) - Everyb-1.mp3",
  "Contents/Alphadog/Tarantela EP/8A - 122 - Alphadog - Inspiration (Origina-1.mp3",
  "Contents/Mr Morek/Massive Landing EP/10A - 120 - Mr Morek - Massive Landing (No-1.mp3"
]

playlist_path = "playlists/2025-april-pool-party.m3u8"
dry_run = ARGV.include?("--dry-run") || !ARGV.include?("--apply")

if dry_run
  puts "DRY RUN MODE: No changes will be made. Use --apply to make changes."
end

changes = sanitize_problematic_files(collection_base, problem_files, dry_run)
update_playlist(File.join(collection_base, playlist_path), changes, dry_run) if changes.any?
