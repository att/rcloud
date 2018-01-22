## NOTE: this uses a separate process for each cell, so you cannot
## set env vars in one cell and use them in another
## However, it does share the R env, so you can use R cells to set env vars

rcloud.language.support <- function()
{
    ev <- function(command, silent, rcloud.session, partname) {
        f <- tempfile("script-", fileext=".sh")
        on.exit(try(unlink(f), silent=TRUE))
        writeLines(if (length(command)) command else "", f)
        ## FIXME: how can we make the shell configurable?
        res <- .Call(shexec, "/bin/bash", f)
        ## turn non-0 exit into an error so it stops
        ## notebook execution - just like Makefiles
        if (res) structure(list(error=paste("Shell terminated with exit code",res)), class="cell-eval-error") else invisible(res)
    }
    
    complete <- function(text, pos, rcloud.session) {
        ## FIXME: we could probably use something like compgen -cfk if we can assume bash ... */
        character(0)
    }

    list(language="shell",
         run.cell=ev,
         complete=complete,
         ace.mode="ace/mode/sh",
         hljs.class="sh",
         extension="sh",
         setup=function(rcloud.session) {},
         teardown=function(rcloud.session) {})
}
