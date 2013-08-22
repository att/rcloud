initial.ocaps <- function()
{
  list(
    # ocaps used by rcloud.js
    rcloud=list(
      session_init=make.oc(session.init),
      session_markdown_eval=make.oc(function(command, silent) {
        session.markdown.eval({
          markdownToHTML(text=paste(knit(text=command), collapse="\n"),
                         fragment=TRUE)
        }, silent)
      }),

      prefix_uuid=make.oc(rcloud.prefix.uuid),
      search=make.oc(rcloud.search),
      load_user_config=make.oc(rcloud.load.user.config),
      load_multiple_user_configs=make.oc(rcloud.load.multiple.user.configs),
      save_user_config=make.oc(rcloud.save.user.config),
      get_notebook=make.oc(rcloud.get.notebook),
      update_notebook=make.oc(rcloud.update.notebook),
      fetch_deferred_result=make.oc(rcloud.fetch.deferred.result),
      get_users=make.oc(rcloud.get.users),
      rename_notebook=make.oc(rcloud.rename.notebook),

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
