require 'sinatra'
require 'sinatra/json'
require 'sqlite3'
require 'json'
require 'time'

# Configure Sinatra
set :port, 4567
set :public_folder, '.'
set :static, true

# Initialize database
db = SQLite3::Database.new('sayless.db')
db.execute <<-SQL
  CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
  );
SQL

# Serve the signup page
get '/' do
  send_file 'index.html'
end

get '/signup' do
  send_file 'signup.html'
end

# API endpoint for email signup
post '/api/signup' do
  content_type :json
  
  begin
    # Parse request body
    request_body = JSON.parse(request.body.read)
    email = request_body['email']
    
    # Basic email validation
    unless email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i
      status 400
      return json error: 'INVALID EMAIL FORMAT'
    end
    
    # Get client IP
    ip_address = request.ip
    
    # Insert into database
    db.execute('INSERT INTO signups (email, ip_address) VALUES (?, ?)', [email, ip_address])
    
    status 201
    json message: 'SIGNUP SUCCESSFUL'
    
  rescue SQLite3::ConstraintException => e
    status 409
    json error: 'EMAIL ALREADY REGISTERED'
  rescue JSON::ParserError => e
    status 400
    json error: 'INVALID REQUEST'
  rescue => e
    status 500
    json error: 'SERVER ERROR'
  end
end

# Admin endpoint to view signups (protect this in production!)
get '/admin/signups' do
  content_type :json
  
  signups = db.execute('SELECT email, created_at FROM signups ORDER BY created_at DESC')
  json signups: signups.map { |row| { email: row[0], created_at: row[1] } }
end