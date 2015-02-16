rcloud.supported.languages <- function()
{
  c(list(Markdown=list(is.a.markdown=TRUE, ace.mode="ace/mode/rmarkdown", extension="md")),
    lapply(.session$languages,
           function(lang) list(is.a.markdown = lang$is.a.markdown,
                               ace.mode = lang$ace.mode,
                               hljs.class = lang$hljs.class,
                               extension = lang$extension)))
}
