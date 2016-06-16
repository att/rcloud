.eval <- function(o, result=TRUE, where=parent.frame(), context="OCAP-call") {
    o <- Rserve.eval(o, where, last.value=result, context=context)
    ## ulog("OCAP-EVAL: ", paste(capture.output(str(o)), collapse='\n'))
    if (inherits(o, "Rserve-eval-error")) {
        class(o) <- "OCAP-eval-error"
        o$traceback <- unlist(o$traceback)
        ## ulog("OCAP-EVAL-ERROR: ", paste(capture.output(str(o)), collapse='\n'))
        o
    } else o
}

.rc.oobSend <- function(kind, ...) self.oobSend(list(kind, Rserve.context(), ...))

make.oc <- function(fun, name=deparse(substitute(fun))) {
  f <- function(...) .eval(quote(fun(...)))
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

oc.init.authenticate <- function(v, mode="IDE") {
    .session$mode <- mode
    if (RC.authenticate(v)) {
        ulog("INFO: oc.init.authenticate authenticated user='", .session$user, "', exec.usr='", as.character(.session$exec.usr), "', mode=", mode)
        authenticated.ocaps(mode)
    } else if (RC.auth.anonymous(v)) {
        ulog("INFO: oc.init.authenticate anonymous, exec.usr='", as.character(.session$exec.usr),"', mode=", mode)
        unauthenticated.ocaps(mode)
    } else {
        ulog("INFO: oc.init.authenticate REJECTED")
        list() ## we don't allow anything if the access was denied
    }
}

oc.init <- function(...) { ## this is the payload of the OCinit message
    ## remove myself from the global env since my job is done
    if (identical(.GlobalEnv$oc.init, oc.init)) rm(oc.init, envir=.GlobalEnv)

    ## simply send the cap that authenticates and returns supported caps
    make.oc(oc.init.authenticate)
}

compute.ocaps <- function(mode, authenticated) {
    if (isTRUE(.session$separate.compute)) {
        .Call(Rserve:::Rserve_forward_stdio)
        ## second part of the CURL+SSL bug work-around
        RCurl:::curlGlobalInit()
    }
    caps <- list(
        setup_js_installer = make.oc(rcloud.setup.js.installer),
        install_notebook_stylesheets = make.oc(rcloud.install.notebook.stylesheets),
        raise = make.oc(function(msg) stop(paste("Forced exception", msg))),
        unauthenticated_session_cell_eval = make.oc(rcloud.unauthenticated.session.cell.eval),
        unauthenticated_call_notebook = make.oc(rcloud.unauthenticated.call.notebook),
        unauthenticated_call_fastrweb_notebook = make.oc(rcloud.unauthenticated.call.FastRWeb.notebook),
        unauthenticated_compute_init = make.oc(rcloud.anonymous.compute.init),
        reset_session = make.oc(rcloud.reset.session),
        prefix_uuid = make.oc(rcloud.prefix.uuid),
        load_notebook = if (authenticated) make.oc(rcloud.load.notebook.compute) else make.oc(rcloud.unauthenticated.load.notebook.compute),
        render_plot = make.oc(rcloud.render.plot),
        render_formats = make.oc(rcloud.available.render.formats),
        help = make.oc(rcloud.help),
        get_thumb = make.oc(rcloud.get.thumb),
        get_fork_count = make.oc(rcloud.get.fork.count)
        )
    if (authenticated) c(caps, list(
        compute_init = make.oc(rcloud.compute.init),
        authenticated_session_cell_eval = make.oc(rcloud.authenticated.cell.eval),
        call_notebook = make.oc(rcloud.call.notebook),
        get_completions = make.oc(rcloud.get.completions),
        call_fastrweb_notebook = make.oc(rcloud.call.FastRWeb.notebook),
        load_module_package = make.oc(rcloud.load.module.package)
        )) else caps
}

## forks a compute process (if needed) and calls compute.ocaps()
.setup.compute <- function(mode, authenticated) {
    cs.modes <- if (nzConf("compute.separation.modes")) strsplit(getConf("compute.separation.modes"), "[, ]+")[[1]] else character()
    if (mode %in% cs.modes) { ## use fork only in modes that require it
        .session$separate.compute <- TRUE
        ## this is a work-around for a bug in CURL+SSL which break on fork()
        gc()
        RCurl:::curlGlobalCleanup()
        res <- .Call(Rserve:::Rserve_fork_compute, bquote(rcloud.support:::compute.ocaps(.(mode), .(authenticated))))
        RCurl:::curlGlobalInit()
        res
    } else {
        .session$separate.compute <- FALSE
        rcloud.support:::compute.ocaps(mode, authenticated)
    }
}

## compute is optional (intended as pass-through from authenticated) and will be created if not supplied
unauthenticated.ocaps <- function(mode, compute)
{
    if (missing(compute)) compute <- .setup.compute(mode, FALSE)

    list(
    # ocaps used by rcloud.js
    rcloud=list(
      authenticated = FALSE,
      mode = mode,
      version_info = make.oc(rcloud.info),
      anonymous_session_init = make.oc(rcloud.anonymous.session.init),
      anonymous_compute_init = compute$unauthenticated_compute_init,
      reset_session = compute$reset_session,
      has_compute_separation = make.oc(rcloud.has.compute.separation),
      prefix_uuid = compute$prefix_uuid,
      get_conf_value = make.oc(rcloud.get.conf.value),
      get_conf_values = make.oc(rcloud.get.conf.values),
      get_gist_sources = make.oc(rcloud.get.gist.sources),
      get_notebook = make.oc(rcloud.unauthenticated.get.notebook),
      load_notebook = make.oc(rcloud.unauthenticated.load.notebook),
      load_notebook_compute = compute$load_notebook,
      call_notebook = compute$unauthenticated_call_notebook,
      call_fastrweb_notebook = compute$unauthenticated_call_fastrweb_notebook,
      notebook_by_name = make.oc(rcloud.unauthenticated.notebook.by.name),
      get_version_by_tag = make.oc(rcloud.get.version.by.tag),
      get_tag_by_version = make.oc(rcloud.get.tag.by.version),
      install_notebook_stylesheets = compute$install_notebook_stylesheets,
      is_notebook_published = make.oc(rcloud.is.notebook.published),
      is_notebook_visible = make.oc(rcloud.is.notebook.visible),
      signal_to_compute = make.oc(.signal.to.compute),
      help = compute$help,
      get_thumb = compute$get_thumb,
      get_fork_count = compute$get_fork_count,
      get_users = make.oc(rcloud.get.users),

      # javascript.R
      setup_js_installer = compute$setup_js_installer,

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
          raise=compute$raise
        ),

      # stars
      stars=list(
        star_notebook = make.oc(rcloud.star.notebook),
        unstar_notebook = make.oc(rcloud.unstar.notebook),
        is_notebook_starred = make.oc(rcloud.is.notebook.starred),
        get_notebook_star_count = make.oc(rcloud.notebook.star.count),
        get_notebook_starrer_list = make.oc(rcloud.notebook.starrer.list),
        get_multiple_notebook_star_counts = make.oc(rcloud.multiple.notebook.star.counts),
        get_my_starred_notebooks = make.oc(rcloud.get.my.starred.notebooks)
      ),

      # discovery
      discovery=list(
        get_notebooks = make.oc(rcloud.config.unauthenticated.get.notebooks.discover)
      ),

      session_cell_eval = compute$unauthenticated_session_cell_eval,

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
        ),

      # multi-language support
      languages = list(
        get_list = make.oc(rcloud.supported.languages)
        ),

      plots = list(
        render = compute$render_plot,
        get_formats = compute$render_formats
        )
      )
    )
}

authenticated.ocaps <- function(mode)
{
    compute <- .setup.compute(mode, TRUE)
    basic.ocaps <- unauthenticated.ocaps(mode, compute)

  changes <- list(
    rcloud = list(
      authenticated = TRUE,
      session_init = make.oc(rcloud.session.init),
      compute_init = compute$compute_init,
      session_markdown_eval = make.oc(session.markdown.eval),
      authenticated_cell_eval = compute$authenticated_session_cell_eval,
      get_notebook = make.oc(rcloud.get.notebook),
      load_notebook = make.oc(rcloud.load.notebook),
      notebook_by_name = make.oc(rcloud.notebook.by.name),
      update_notebook = make.oc(rcloud.update.notebook),
      create_notebook = make.oc(rcloud.create.notebook),
      rename_notebook = make.oc(rcloud.rename.notebook),
      tag_notebook_version = make.oc(rcloud.tag.notebook.version),
      publish_notebook = make.oc(rcloud.publish.notebook),
      unpublish_notebook = make.oc(rcloud.unpublish.notebook),
      set_notebook_visibility = make.oc(rcloud.set.notebook.visibility),
      fork_notebook = make.oc(rcloud.fork.notebook),
      port_notebooks = make.oc(rcloud.port.notebooks),
      notebook_cells = make.oc(rcloud.notebook.cells),
      get_thumb = make.oc(rcloud.get.thumb),
      get_fork_count = make.oc(rcloud.get.fork.count),
      call_notebook = compute$call_notebook,
      get_completions = compute$get_completions,

      # This will cause bugs, because some notebooks want a
      # call_fastrweb_notebook...
      call_fastrweb_notebook = compute$call_fastrweb_notebook,

      # externally used ocaps
      load_module_package = compute$load_module_package,

      # file upload ocaps
      file_upload = list(
        create = make.oc(rcloud.upload.create.file),
        write = make.oc(rcloud.upload.write.file),
        close = make.oc(rcloud.upload.close.file),
        upload_path = make.oc(rcloud.upload.path)
        ),
      ### FIXME: remove from ocaps - we should not be using this anymore,
      ### it has been replaced by update_notebook
      notebook_upload = make.oc(.rcloud.upload.to.notebook),

      # security: request new token
      replace_token = make.oc(replace.token),

      # notebook protection
      protection = list(
        get_notebook_cryptgroup = make.oc(rcloud.get.notebook.cryptgroup),
        set_notebook_cryptgroup = make.oc(rcloud.set.notebook.cryptgroup),
        get_cryptgroup_users = make.oc(rcloud.get.cryptgroup.users),
        get_user_cryptgroups = make.oc(rcloud.get.user.cryptgroups),
        create_cryptgroup = make.oc(rcloud.create.cryptgroup),
        set_cryptgroup_name = make.oc(rcloud.set.cryptgroup.name),
        add_cryptgroup_user = make.oc(rcloud.add.cryptgroup.user),
        remove_cryptgroup_user = make.oc(rcloud.remove.cryptgroup.user),
        delete_cryptgroup = make.oc(rcloud.delete.cryptgroup),
        has_notebook_protection = make.oc(rcloud.has.notebook.protection)
        ),

      # commenting ocaps
      comments = list(
        post = make.oc(rcloud.post.comment),
        modify = make.oc(rcloud.modify.comment),
        delete = make.oc(rcloud.delete.comment)
        ),

      # discovery
      discovery=list(
        get_notebooks = make.oc(rcloud.config.get.notebooks.discover)
      ),


      config = list(
        all_notebooks = make.oc(rcloud.config.all.notebooks),
        all_user_notebooks = make.oc(user.all.notebooks),
        all_notebooks_multiple_users = make.oc(rcloud.config.all.notebooks.multiple.users),
        get_all_notebook_info= make.oc(rcloud.config.get.all.notebook.info),
        add_notebook = make.oc(rcloud.config.add.notebook),
        remove_notebook = make.oc(rcloud.config.remove.notebook),
        get_current_notebook = make.oc(rcloud.config.get.current.notebook),
        set_current_notebook = make.oc(rcloud.config.set.current.notebook),
        new_notebook_number = make.oc(rcloud.config.new.notebook.number),
        get_recent_notebooks = make.oc(rcloud.config.get.recent.notebooks),
        set_recent_notebook = make.oc(rcloud.config.set.recent.notebook),
        clear_recent_notebook = make.oc(rcloud.config.clear.recent.notebook),
        get_user_option = make.oc(rcloud.config.get.user.option),
        set_user_option = make.oc(rcloud.config.set.user.option),
        get_alluser_option = make.oc(rcloud.config.get.alluser.option)
        ),

      get_notebook_info = make.oc(rcloud.get.notebook.info),
      get_multiple_notebook_infos = make.oc(rcloud.get.multiple.notebook.infos),
      set_notebook_info = make.oc(rcloud.set.notebook.info),

      get_notebook_property = make.oc(rcloud.get.notebook.property),
      set_notebook_property = make.oc(rcloud.set.notebook.property),
      remove_notebook_property = make.oc(rcloud.remove.notebook.property),

      purl_source = make.oc(rcloud.purl.source)

      )
  )

  ## search is optional
  if (nzConf("solr.url"))
    changes$rcloud$search <- make.oc(rcloud.search)

  modifyList(basic.ocaps, changes)
}
