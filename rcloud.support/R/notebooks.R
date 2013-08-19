## infrastructure for gist-based rcloud notebooks

create.notebook <- function()
  get.user.gists(.session$rgithub.context, .session$username)
