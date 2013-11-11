make.oc <- function(fun, name=deparse(substitute(fun))) {
  f <- function(...) try(fun(...), silent=TRUE)
  .Call(Rserve_oc_register, f, name)
}

oc.init <- function(...) { ## this is the payload of the OCinit message
  ## remove myself from the global env since my job is done
  if (identical(.GlobalEnv$oc.init, oc.init)) rm(oc.init, envir=.GlobalEnv)
  ## simply send the cap that authenticates and returns supported caps
  make.oc(function(v) if (RC.authenticate(v)) initial.ocaps() else NULL, "oc.init")
}

initial.ocaps <- function()
{
  list(
    # ocaps used by rcloud.js
    rcloud=list(
      session_init=make.oc(session.init),
      session_markdown_eval=make.oc(session.markdown.eval),
      prefix_uuid=make.oc(rcloud.prefix.uuid),
      search=make.oc(rcloud.search),
      load_user_config=make.oc(rcloud.load.user.config),
      reset_session=make.oc(reset.session),
      load_multiple_user_configs=make.oc(rcloud.load.multiple.user.configs),
      save_user_config=make.oc(rcloud.save.user.config),
      get_conf_value=make.oc(rcloud.get.conf.value),
      get_notebook=make.oc(rcloud.get.notebook),
      call_notebook=make.oc(rcloud.call.notebook),
      update_notebook=make.oc(rcloud.update.notebook),
      create_notebook=make.oc(rcloud.create.notebook),
      rename_notebook=make.oc(rcloud.rename.notebook),
      
      publish_notebook=make.oc(rcloud.publish.notebook),
      unpublish_notebook=make.oc(rcloud.unpublish.notebook),
      is_notebook_published=make.oc(rcloud.is.notebook.published),
      
      fork_notebook=make.oc(rcloud.fork.notebook),
      port_notebooks=make.oc(rcloud.port.notebooks),
      get_users=make.oc(rcloud.get.users),
      get_completions=make.oc(rcloud.get.completions),
      call_fastrweb_notebook=make.oc(rcloud.call.FastRWeb.notebook),

      # javascript.R
      setup_js_installer=make.oc(rcloud.setup.js.installer),

      # file upload ocaps
      file_upload=list(
        create=make.oc(rcloud.upload.create.file),
        write=make.oc(rcloud.upload.write.file),
        close=make.oc(rcloud.upload.close.file),
        upload_path=make.oc(rcloud.upload.path)
        ),

      # logging ocaps
      log=list(
        record_cell_execution=make.oc(rcloud.record.cell.execution)
        ),

      # commenting ocaps
      comments=list(
        get_all=make.oc(rcloud.get.comments),
        post=make.oc(rcloud.post.comment)
        ),

      # debugging
      debug=list(
        raise=make.oc(function(msg) stop(paste("Forced exception", msg)))
        ),

      # stars
      stars=list(
        star_notebook=make.oc(rcloud.star.notebook), 
        unstar_notebook=make.oc(rcloud.unstar.notebook),
        is_notebook_starred=make.oc(rcloud.is.notebook.starred),
        get_notebook_star_count=make.oc(rcloud.notebook.star.count),
        get_my_starred_notebooks=make.oc(rcloud.get.my.starred.notebooks)
        )

      )
    ## session.eval=make.oc(session.eval),
    ## session.markdown.eval=make.oc(session.markdown.eval),
    ## session.log=make.oc(session.log),
    ## rcloud.record.cell.execution=make.oc(rcloud.record.cell.execution),
    ## rcloud.prefix.uuid=make.oc(rcloud.prefix.uuid),
    ## rcloud.search=make.oc(rcloud.search),
    ## rcloud.load.user.config=make.oc(rcloud.load.user.config)
    )
}

wrap.js.fun <- function(s)
{
  if (!inherits(s, "javascript_function"))
    stop("Can only wrap 'javascript_function's");
  function(...) self.oobMessage(list(s, ...))
}

wrap.all.js.funs <- function(v)
{
  if (inherits(v, 'javascript_function'))
    wrap.js.fun(v)
  else if (is.list(v))
    lapply(v, wrap.all.js.funs)
  else
    v
}
