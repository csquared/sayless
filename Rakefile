desc "Start the server"
task :start do
  exec "bundle exec ruby app.rb"
end

desc "Start the server with auto-reload (development)"
task :dev do
  exec "bundle exec rerun 'ruby app.rb'"
end