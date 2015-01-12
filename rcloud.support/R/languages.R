rcloud.supported.languages <- function()
{
  c(list(Markdown=list(ace.mode="ace/mode/rmarkdown", extension="md")),
    lapply(.session$languages,
           function(lang) list(ace.mode = lang$ace.mode,
                               hljs.class = lang$hljs.class,
                               extension = lang$extension)))
}
