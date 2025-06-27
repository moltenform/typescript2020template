#!/usr/bin/env ruby

require "webrick"

shouldWeLogAccess = false
thedir = './dist'
thelogdest = 'C:\\m\\m_temporary\\websites_mine_temporary\\serverlog.log'


# set path=%path%;C:\data\e5\unzipped\devkits\Ruby25-x64\bin

# we could use this if we wanted to log server operations / internal server errors
#~ log_file = File.open 'C:\\data\\local\\no_copies_needed\\website_symlinks\\webrick.log', 'a+'
#~ log = WEBrick::Log.new log_file
#~ WEBrick::HTTPServer.new(:Logger => log,
#~ access_log = [
  #~ [log_file, WEBrick::AccessLog::COMBINED_LOG_FORMAT],
#~ ]
# Dir.pwd

log_file = File.open thelogdest, 'a+'
access_log = [
  [log_file, "%h\t%l\t%u\t%t\t\"%r\"\t%>s\t%b"],
]


#http://chrismdp.com/2011/12/cache-busting-ruby-http-server/
class NonCachingFileHandler < WEBrick::HTTPServlet::FileHandler
  def prevent_caching(res)
    res['ETag']          = nil
    res['Last-Modified'] = Time.now - 100**4  # Time.now + 100**4
    res['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    res['Pragma']        = 'no-cache'
    res['Expires']       = Time.now - 100**4
  end

  def do_GET(req, res)
    super
    prevent_caching(res)
  end
end

typeMaps = WEBrick::HTTPUtils::DefaultMimeTypes
typeMaps['webp'] = "image/webp"
typeMaps['txt'] = "text/plain; charset=UTF-8"
if shouldWeLogAccess then
  server = WEBrick::HTTPServer.new(:Port => 4000, :DocumentRoot => thedir, :AccessLog=>access_log, :MimeTypes=>typeMaps)
else
  server = WEBrick::HTTPServer.new(:Port => 4000, :DocumentRoot => thedir, :MimeTypes=>typeMaps)
end
server.mount '/', NonCachingFileHandler , thedir
trap('INT') { server.stop }
server.start



