.setup.su <- function(exec.usr) {
  ## change ownership of the working directory (session home) and rc-specific user home
  dir.create(rc.user.home <- pathConf("rcloud.user.home", exec.usr), FALSE, TRUE, "0700")
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
  .libPaths(c(rc.user.lib, .libPaths()))
  
  if (rcloud.debug.level()) cat(" - setuid/gid, now running as", exec.usr, "\n")
}

## token verification - can be used as login authentication function
## input is a vector of authentication tokens
## if check.only is TRUE then it only checks the validity but
## does not perform any authentication-related actions
RC.authenticate <- function(v, check.only=FALSE)
{
  v <- as.list(v)
  if (length(v) < 1 || is.null(v[[1]])) return(FALSE)
  ## is execution authentication enabled?
  if (nzConf("exec.auth")) {
    ## FIXME: should we allow anonymous execution and logged-in github? We don't support that now...
    if (length(v) < 2 || is.null(v[[2]])) return(FALSE)
    exec.usr <- check.token(v[[2]], paste0("auth/",getConf("exec.auth")), "rcloud.exec")
    if (exec.usr == FALSE) return(FALSE)
    if (identical(getConf("exec.match.user"), "login") && !check.only) .setup.su(exec.usr)
    .session$exec.usr <- exec.usr
  }

  ## if not, just check the first token.
  user <- check.token(v[[1]])
  if (user == FALSE) return(FALSE)
  ## but if we have a github user whitelist, check against that as well.
  .session$user <- user

  if (!hasConf("github.user.whitelist")) return(TRUE)
  userlist <- gsub("^\\s+","",gsub("\\s+$","",unlist(strsplit(getConf("github.user.whitelist"), ','))))
  user %in% userlist
}

## attempts to setup anonymous (non-GitHub) access. Returns FALSE if not allowed,
## TRUE if successful
RC.auth.anonymous <- function(v=NULL, check.only=FALSE) {
  ## FIXME: we may want to add an option to disable anonymous access even without exec.auth
  if (!nzConf("exec.auth")) return(TRUE) ## no exec auth -> allow anonymous and nothing to do

  v <- as.list(v)
  exec.token <- if (length(v) > 1L) v[[2]] else if (length(v) == 1L) v[[1]] else NULL
  exec.usr <- if (!is.null(exec.token)) ## if there is an exec token, check it
    check.token(exec.token, paste0("auth/",getConf("exec.auth")), "rcloud.exec") else FALSE
  if (exec.usr == FALSE) { ## truly anonymous execution
    if (nzConf("exec.anon.user")) { ## anonymous user specified, so we allow access as we switch
      if (!check.only) .setup.su(.session$exec.usr <- getConf("exec.anon.user"))
      TRUE
    } else FALSE ## if there is no exec.anon.user then we fail since we cannot allow anonymous as root
  } else { ## valid execution token - switch users if needed
    if (identical(getConf("exec.match.user"), "login") && !check.only) .setup.su(exec.usr)
    .session$exec.usr <- exec.usr
    TRUE
  }
}
