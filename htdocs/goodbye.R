run <- function(...)
list(paste0(
'<html>
  <head>
    <title>RCloud</title>
    <link rel="shortcut icon" type="image/x-icon" href="favicon.png" />
    <link rel="stylesheet" type="text/css" href="css/rcloud.css"/>
  </head>
  <body id="goodbye">
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-header">
        <a class="navbar-brand" href="/login.R">RCloud</a>
      </div>
    </div>
    <div class="container" id="main-div" style="margin-top: 150px;">
      <p>You are now logged out of RCloud. <a href="/login.R">Log back in.</a></p>
', if (isTRUE(getConf("github.auth") == "exec.token") || !isTRUE(nzchar(rcloud.config('github.base.url')))) "" else paste0(
'<p>However, you may still be logged into <a href="',rcloud.config('github.base.url'),'">GitHub</a>,
      use <a href="',gsub("/+$","",rcloud.config('github.base.url')),'/logout">GitHub Logout</a> to log out of there as well.'),'
    </div>
  </body>
</html>'), "text/html")
