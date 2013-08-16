## token verification - can be used as login authentication function
## input is a vector of authentication tokens
## if check.only is TRUE then it only checks the validity but
## does not perform any authentication-related actions
RC.authenticate <- function(v, check.only=FALSE)
{
  ## is execution authentication enabled?
  if (!is.null(rcloud.support:::.rc.conf$exec.auth)) {
    exec.usr <- check.token(v[[2]], rcloud.support:::.rc.conf$exec.auth, "rcloud.exec")
    if (exec.usr == FALSE) return(FALSE)
    if (identical(rcloud.support:::.rc.conf$exec.match.user, "login")) {
      ## change ownership of the working directory (session home) and rc-specific user home
      dir.create(rc.user.home <- file.path(rcloud.support:::.rc.conf$data.root, "home", exec.usr), FALSE, TRUE, "0700")
      dir.create(td <- paste(tempdir(), exec.usr, sep='-'), FALSE, TRUE, "0700")
      unixtools::chown(c(getwd(), rc.user.home, td), exec.usr, NULL)
      ## switch users
      unixtools::set.user(exec.usr)
      ## also adjust HOME and USER env vars
      home <- unixtools::user.info()$home
      if (!is.na(home)) Sys.setenv(HOME=home)
      Sys.setenv(USER=exec.usr)
      
      ## use user-specific tempdir (so we have write-permission) in this session
      unixtools::set.tempdir(td)
      
      ## create user-specific library so users can install private packages if they so desire ...
      dir.create(rc.user.lib <- file.path(rc.user.home, "library"), FALSE, TRUE, "0700")
      .libPaths(rc.user.lib)
      
      if (rcloud.debug.level()) cat(" - setuid/gid, now running as", exec.usr, "\n")
    }
  }
  ## if not, jsut check the first token
  check.token(v[[1]]) != FALSE
}

