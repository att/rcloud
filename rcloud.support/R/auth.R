## token verification - can be used as login authentication function
## input is a vector of authentication tokens
## if check.only is TRUE then it only checks the validity but
## does not perform any authentication-related actions
RC.authenticate <- function(v, check.only=FALSE)
{
  if (is.null(v[[1]])) return(FALSE)
  ## is execution authentication enabled?
  if (nzConf("exec.auth")) {
    if (is.null(v[[2]])) return(FALSE)
    exec.usr <- check.token(v[[2]], getConf("exec.auth"), "rcloud.exec")
    if (exec.usr == FALSE) return(FALSE)
    if (identical(getConf("exec.match.user"), "login")) {
      ## change ownership of the working directory (session home) and rc-specific user home
      dir.create(rc.user.home <- pathConf("data.root", "home", exec.usr), FALSE, TRUE, "0700")
      dir.create(td <- paste(tempdir(), exec.usr, sep='-'), FALSE, TRUE, "0700")
      unixtools::chown(c(getwd(), rc.user.home, td), exec.usr, NULL)
      Sys.chmod(getwd(), "0700") ## also change mode of the Rserve connection directory
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

  ## if not, just check the first token.
  user <- check.token(v[[1]])
  if (user == FALSE) return(FALSE)
  ## but if we have a github user whitelist, check against that as well.
  if (!hasConf("github.user.whitelist")) return(TRUE)
  userlist <- strsplit(getConf("github.user.whitelist")[1], ',')
  r <- grep(user, userlist)
  length(r) != 0
}

