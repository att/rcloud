make.oc <- function(fun) {
  f <- function(...) {
    try(fun(...))
  }
  .Call(Rserve_oc_register, f)
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

oc.init <- function(...) { ## this is the payload of the OCinit message
  ## remove myself from the global env since my job is done
  if (identical(.GlobalEnv$oc.init, oc.init)) rm(oc.init, envir=.GlobalEnv)

  ## simply send the cap that authenticates and returns supported caps
  make.oc(function(v) {
    if (RC.authenticate(v)) {
      cat("AUTHENTICATED!")
      authenticated.ocaps()
    } else {
      cat("UNAUTHENTICATED!")
      unauthenticated.ocaps()
    }
  })
}

unauthenticated.ocaps <- function()
{
  list(
    # ocaps used by rcloud.js
    rcloud=list(
      authenticated = FALSE,
      anonymous_session_init = make.oc(rcloud.anonymous.session.init),
      prefix_uuid = make.oc(rcloud.prefix.uuid),
      reset_session = make.oc(reset.session),
      get_conf_value = make.oc(rcloud.get.conf.value),
      get_notebook = make.oc(rcloud.get.notebook),
      
      is_notebook_published = make.oc(rcloud.is.notebook.published),
      
      get_users = make.oc(rcloud.get.users),

      # javascript.R
      setup_js_installer = make.oc(rcloud.setup.js.installer),

      # logging ocaps
      log = list(
        record_cell_execution = make.oc(rcloud.record.cell.execution)
        ),

      # commenting ocaps
      comments = list(
        get_all = make.oc(rcloud.get.comments)
        ),

      # debugging
      debug = list(
        raise = make.oc(function(msg) stop(paste("Forced exception", msg)))
        ),

      # graphics
      graphics = list(
        set_device_pixel_ratio = make.oc(rcloud.set.device.pixel.ratio)
        )
      )
    )
}

authenticated.ocaps <- function()
{
  basic.ocaps <- unauthenticated.ocaps()
  c <- list(
    rcloud = list(
      authenticated = TRUE,
      session_init = make.oc(rcloud.session.init),
      session_markdown_eval = make.oc(session.markdown.eval),
      load_user_config = make.oc(rcloud.load.user.config),
      save_user_config = make.oc(rcloud.save.user.config),
      load_multiple_user_configs = make.oc(rcloud.load.multiple.user.configs),
      search = make.oc(rcloud.search),
      update_notebook = make.oc(rcloud.update.notebook),
      create_notebook = make.oc(rcloud.create.notebook),
      rename_notebook = make.oc(rcloud.rename.notebook),
      publish_notebook = make.oc(rcloud.publish.notebook),
      unpublish_notebook = make.oc(rcloud.unpublish.notebook),
      fork_notebook = make.oc(rcloud.fork.notebook),
      call_notebook = make.oc(rcloud.call.notebook),
      get_completions = make.oc(rcloud.get.completions),
      call_fastrweb_notebook = make.oc(rcloud.call.FastRWeb.notebook),
      
      # file upload ocaps
      file_upload = list(
        create = make.oc(rcloud.upload.create.file),
        write = make.oc(rcloud.upload.write.file),
        close = make.oc(rcloud.upload.close.file),
        upload_path = make.oc(rcloud.upload.path)
        ),
      
      # commenting ocaps
      comments = list(
        post = make.oc(rcloud.post.comment)
        )
           
      )
  )
  modifyList(basic.ocaps, changes)
}
