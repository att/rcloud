make.oc <- function(fun, name=deparse(substitute(fun))) {
  f <- function(...) try(fun(...), silent=TRUE)
  Rserve:::ocap(f, name)
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
      authenticated.ocaps()
    } else if (RC.auth.anonymous(v)) {
      unauthenticated.ocaps()
    } else list() ## we don't allow anything if the access was denied
  }, "oc.init")
}

unauthenticated.ocaps <- function()
{
  list(
    # ocaps used by rcloud.js
    rcloud=list(
      authenticated = FALSE,
      version_info = make.oc(rcloud.info),
      anonymous_session_init = make.oc(rcloud.anonymous.session.init),
      prefix_uuid = make.oc(rcloud.prefix.uuid),
      reset_session = make.oc(rcloud.reset.session),
      get_conf_value = make.oc(rcloud.get.conf.value),
      get_notebook = make.oc(rcloud.unauthenticated.get.notebook),
      load_notebook = make.oc(rcloud.unauthenticated.load.notebook),
      call_notebook = make.oc(rcloud.unauthenticated.call.notebook),
      call_fastrweb_notebook = make.oc(rcloud.unauthenticated.call.FastRWeb.notebook),
      notebook_by_name = make.oc(rcloud.unauthenticated.notebook.by.name),
      install_notebook_stylesheets = make.oc(rcloud.install.notebook.stylesheets),
      is_notebook_published = make.oc(rcloud.is.notebook.published),
      is_notebook_visible = make.oc(rcloud.is.notebook.visible),
      help = make.oc(rcloud.help),

      get_users = make.oc(rcloud.get.users),

      # externally used ocaps
      load_module_package = make.oc(rcloud.load.module.package),

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
      debug=list(
        raise=make.oc(function(msg) stop(paste("Forced exception", msg)))
        ),

      # stars
      stars=list(
        star_notebook = make.oc(rcloud.star.notebook),
        unstar_notebook = make.oc(rcloud.unstar.notebook),
        is_notebook_starred = make.oc(rcloud.is.notebook.starred),
        get_notebook_star_count = make.oc(rcloud.notebook.star.count),
        get_multiple_notebook_star_counts = make.oc(rcloud.multiple.notebook.star.counts),
        get_my_starred_notebooks = make.oc(rcloud.get.my.starred.notebooks)
        ),

      session_cell_eval = make.oc(rcloud.unauthenticated.session.cell.eval),

      # display info
      set_device_pixel_ratio = make.oc(rcloud.set.device.pixel.ratio),

      # runtime API access in javascript
      api = list(
        disable_warnings = make.oc(rcloud.disable.warnings),
        enable_warnings = make.oc(rcloud.enable.warnings),
        disable_echo = make.oc(rcloud.disable.echo),
        enable_echo = make.oc(rcloud.enable.echo),
        set_url = make.oc(rcloud.set.url),
        get_url = make.oc(rcloud.get.url)
        )
      )
    )
}

authenticated.ocaps <- function()
{
  basic.ocaps <- unauthenticated.ocaps()
  changes <- list(
    rcloud = list(
      authenticated = TRUE,
      session_init = make.oc(rcloud.session.init),
      session_markdown_eval = make.oc(session.markdown.eval),
      authenticated_cell_eval = make.oc(rcloud.authenticated.cell.eval),
      get_notebook = make.oc(rcloud.get.notebook),
      load_notebook = make.oc(rcloud.load.notebook),
      notebook_by_name = make.oc(rcloud.notebook.by.name),
      update_notebook = make.oc(rcloud.update.notebook),
      create_notebook = make.oc(rcloud.create.notebook),
      rename_notebook = make.oc(rcloud.rename.notebook),
      publish_notebook = make.oc(rcloud.publish.notebook),
      unpublish_notebook = make.oc(rcloud.unpublish.notebook),
      set_notebook_visibility = make.oc(rcloud.set.notebook.visibility),
      fork_notebook = make.oc(rcloud.fork.notebook),
      port_notebooks = make.oc(rcloud.port.notebooks),
      call_notebook = make.oc(rcloud.call.notebook),
      get_completions = make.oc(rcloud.get.completions),

      # This will cause bugs, because some notebooks want a
      # call_fastrweb_notebook...
      call_fastrweb_notebook = make.oc(rcloud.call.FastRWeb.notebook),

      # file upload ocaps
      file_upload = list(
        create = make.oc(rcloud.upload.create.file),
        write = make.oc(rcloud.upload.write.file),
        close = make.oc(rcloud.upload.close.file),
        upload_path = make.oc(rcloud.upload.path)
        ),
      notebook_upload = make.oc(rcloud.upload.to.notebook),

      # commenting ocaps
      comments = list(
        post = make.oc(rcloud.post.comment),
        modify = make.oc(rcloud.modify.comment),
        delete = make.oc(rcloud.delete.comment)
        ),

      config = list(
        all_notebooks = make.oc(rcloud.config.all.notebooks),
        all_notebooks_multiple_users = make.oc(rcloud.config.all.notebooks.multiple.users),
        add_notebook = make.oc(rcloud.config.add.notebook),
        remove_notebook = make.oc(rcloud.config.remove.notebook),
        get_current_notebook = make.oc(rcloud.config.get.current.notebook),
        set_current_notebook = make.oc(rcloud.config.set.current.notebook),
        new_notebook_number = make.oc(rcloud.config.new.notebook.number),
        get_recent_notebooks = make.oc(rcloud.config.get.recent.notebooks),
        set_recent_notebook = make.oc(rcloud.config.set.recent.notebook),
        clear_recent_notebook = make.oc(rcloud.config.clear.recent.notebook),
        get_user_option = make.oc(rcloud.config.get.user.option),
        set_user_option = make.oc(rcloud.config.set.user.option)
        ),

      get_notebook_info = make.oc(rcloud.get.notebook.info),
      get_multiple_notebook_infos = make.oc(rcloud.get.multiple.notebook.infos),
      set_notebook_info = make.oc(rcloud.set.notebook.info),

      purl_source = make.oc(rcloud.purl.source)

      )
  )

  ## search is optional
  if (nzConf("solr.url"))
    changes$rcloud$search <- make.oc(rcloud.search)
  
  modifyList(basic.ocaps, changes)
}
