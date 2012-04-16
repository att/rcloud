#!/usr/bin/env python
import cgi
form = cgi.FieldStorage()
url = form.getfirst('url')
if url is None:
    url = "http://mbp-cscheid.local:8000/main.html"
user = form.getfirst('user')
if user is None:
    print "Content-type: text/plain\n"
    print "Need username"
else:
    print "Content-type: text/html"
    print "Set-Cookie: user=%s; domain=mbp-cscheid.local; path=/;" % user
    print "Set-Cookie: sessid=lalala; domain=mbp-cscheid.local; path=/;"
    print "Refresh: 1; url=%s" % url
    print
    print "<html>"
    print "<body><p>This is the world's most insecure login setup.</p>"
    print "<p>You're logged in! and now we redirect back to your page...</p>"
    print "<p><a href='%s'>You should be going here soon...</a></p>" % url
    print "</body></html>"
