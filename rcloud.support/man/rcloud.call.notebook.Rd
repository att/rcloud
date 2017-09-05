\name{rcloud.call.notebook}
\alias{rcloud.call.notebook}
\title{
  Execute code contained in a notebook
}
\description{
  \code{rcloud.call.notebook} executes a notebook - essentially the
  equivalent of \code{\link{source}} for notebooks.
}
\usage{
rcloud.call.notebook(id, version = NULL, args = NULL, attach = FALSE)
}
\arguments{
  \item{id}{string, ID of the notebook to call}
  \item{version}{version of the notebook to call or \code{NULL} to call
    the latest version}
  \item{args}{list of arguments to make avaialbe to the notebook or an
    enviroment to evalue the notebook in}
  \item{attach}{logical, if \code{TRUE} then the environment in which
    the notebook was evaluate will be attached to the search path -
    making its results available}
}
\details{
  \code{rcloud.call.notebook} retrieves the notebook specified by
  \code{id} and \code{version} and evaluates the contents of all
  \code{R} cells. Note that all other types of cells (such as Markdown,
  Python, etc.) are currently ignored.

  The notebook is either evaluated in \code{args} if \code{args} is an
  environment, or a new environment (with \code{\link{.GlobalEnv}} as
  parent) is created and populated with the elements of \code{args}.
  If \code{attach} is \code{TRUE} then this environment is attached to
  the search path after evaluation.
}
\value{
  Last value of the evaluated notebook.
}
\author{
  Simon Urbanek
}
%\note{
%}
%\seealso{
%}
%\examples{
%}
\keyword{manip}
