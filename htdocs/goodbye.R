run <- function(...)
list(paste0(
'<html>
  <head>
    <title>RCloud</title>
    <link rel="stylesheet" type="text/css" href="css/custom-theme/jquery-ui-1.8.18.custom.css" />
    <link rel="stylesheet" type="text/css" href="css/font-awesome.css"/>
    <link rel="stylesheet" type="text/css" href="css/jqtree.css"/>
    <link rel="stylesheet" type="text/css" href="css/bootstrap.css"/>
    <link rel="stylesheet" type="text/css" href="css/rmarkdown.css"/>
    <link rel="stylesheet" type="text/css" href="css/main.css"/>
    <link rel="stylesheet" type="text/css" href="css/dc.css"/>
  </head>
  <body>
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-header">
        <a class="navbar-brand" href="/login.R">RCloud - Collaborative data analysis with R</a>
      </div>
    </div>
    <div class="container" id="main-div">
      <p>You are now logged out of RCloud. <a href="/login.R">Log back in.</a></p>
      <p>However, you may still be logged into <a href="',rcloud.config('github.base.url'),'">GitHub</a>,
      use <a href="',gsub("/+$","",rcloud.config('github.base.url')),'/logout">GitHub Logout</a> to log out of there as well.
    </div>
  </body>
</html>'), "text/html")
