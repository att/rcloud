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
    exec.only <- isTRUE(getConf("github.auth") == "exec.token")
    exec.realm <- if(exec.only) "rcloud" else "rcloud.exec"

    v <- as.list(v)
    if (length(v) < 1 || is.null(v[[1]])) return(FALSE)
    if (exec.only) v[[2]] <- v[[1]]
    ## is execution authentication enabled?
    if (nzConf("exec.auth") && !isTRUE(getConf("exec.auth") == "as-local")) {
        ## FIXME: should we allow anonymous execution and logged-in github? We don't support that now...
        if (length(v) < 2 || is.null(v[[2]])) return(FALSE)
        exec.usr <- check.token(v[[2]], paste0("auth/",getConf("exec.auth")), exec.realm)
        if (exec.usr == FALSE) return(FALSE)
        if (identical(getConf("exec.match.user"), "login") && !check.only) .setup.su(exec.usr)
        .session$exec.usr <- exec.usr
        ulog("setup exec for ", exec.usr, " successful")
    }

    ## if not, just check the first token.
    user <- if (exec.only) exec.usr else check.token(v[[1]])
    if (user == FALSE) return(FALSE)

  .session$user <- user

  ## but if we have a github user whitelist, check against that as well.
  if (hasConf("github.user.whitelist")) {
      userlist <- gsub("^\\s+","",gsub("\\s+$","",unlist(strsplit(getConf("github.user.whitelist"), ','))))
      if (!(user %in% userlist)) return(FALSE)
  }

  ## check if the config requests exec user to be based on the gist user
  if (!nzConf("exec.auth") && nzConf("use.gist.user.home") && length(grep("yes", getConf("use.gist.user.home")))) {
      .session$exec.usr <- user
      ## FIXME: should we sanitize the username?
      dir.create(rc.user.home <- pathConf("rcloud.user.home", user), FALSE, TRUE, "0700")
      dir.create(td <- paste(tempdir(), user, sep='-'), FALSE, TRUE, "0700")
      ## also adjust HOME and USER env vars
      Sys.setenv(HOME=rc.user.home)
      ## use user-specific tempdir (so we have write-permission) in this session
      unixtools::set.tempdir(td)

      ## create user-specific library so users can install private packages if they so desire ...
      dir.create(rc.user.lib <- file.path(rc.user.home, "library"), FALSE, TRUE, "0700")
      .libPaths(c(rc.user.lib, .libPaths()))  
  }

    ulog("RC.authenticate successful")
  TRUE
}

## attempts to setup anonymous (non-GitHub) access. Returns FALSE if not allowed,
## TRUE if successful
RC.auth.anonymous <- function(v=NULL, check.only=FALSE) {
  ## FIXME: we may want to add an option to disable anonymous access even without exec.auth
  if (!nzConf("exec.auth") || isTRUE(getConf("exec.auth") == "as-local")) {
      tmp <- tempdir() ## make sure tempdir exists (safe to create as there is no switching)
      if (!dir.exists(tmp)) dir.create(tmp, FALSE, TRUE, "0700")
      return(TRUE) ## no exec auth -> allow anonymous and nothing to do
  }

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
