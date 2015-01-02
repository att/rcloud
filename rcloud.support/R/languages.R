rcloud.supported.languages <- function()
{
  c(list(Markdown=list(ace.mode="ace/mode/rmarkdown", extension="md")),
    lapply(.session$languages, function(l) l[c('ace.mode', 'extension')]))
}
