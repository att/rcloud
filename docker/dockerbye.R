run <- function(...)
list(paste0(
'<html>
  <head>
    <title>RCloud</title>
    <link rel="stylesheet" type="text/css" href="css/rcloud.css"/>
  </head>
  <body id="goodbye">
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-header">
        <a class="navbar-brand" href="',rcloud.config('welcome.page'),'">RCloud</a>
      </div>
    </div>
    <div class="container" id="main-div" style="margin-top: 150px;">
      <p>You are now logged out of RCloud. <a href="',rcloud.config('welcome.page'),'"> Log back in.</a></p>
    </div>
  </body>
</html>'), "text/html")
