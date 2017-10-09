\name{rcloud.get.asset}
\alias{rcloud.get.asset}
\alias{rcloud.execute.asset}
\title{
  Access and execute notebook assets
}
\description{
  \code{rcloud.get.asset} retrieves a notebook asset

  \code{rcloud.execute.asset} retrieves a notebook asset as a file and
  executes it
}
\usage{
rcloud.get.asset(name, notebook = rcloud.session.notebook(), version = NULL,
                 cached = TRUE, quiet = FALSE, as.file = FALSE)
rcloud.execute.asset(name, ..., notebook = rcloud.session.notebook(), version = NULL,
                 cached = TRUE, wait = TRUE, env = FALSE)
}
\arguments{
  \item{name}{name of the asset}
  \item{notebook}{notebook object or notebook ID}
  \item{version}{version to retrieve or \code{NULL} for the latest version}
  \item{cached}{logical, if \code{TRUE} then a cached version will be
    used if available (typically only the session notebook is cached)}
  \item{quiet}{logical, if \code{TRUE} then a non-existent asset will
    not raise an error but return \code{NULL} instead}
  \item{as.file}{logical, if \code{TRUE} then the asset is stored in a
    file and the result is the full path to the resulting file,
    otherwise the asset content is returned directly}
  \item{...}{any additional arguments to pass to the interpreter
    running the asset}
  \item{env}{only used for R assets, either en environment in which to
  evaluate the code or \code{FALSE} for global environment or
  \code{TRUE} for a local environment}
}
\details{
  \code{rcloud.get.asset} loads a notebook and retrieves the asset of
  the name \code{name} from the notebook.

  \code{rcloud.execute.asset} first calls
  \code{rcloud.get.asset(..., as.file=TRUE)} and then executes the
  resulting file. If the file has a known extension the driver for the
  file is executed with the filename instead of the file itself. For R
  assets the file is \code{\link{source}}d instead of shell execution,
  so it is equivalent to sourcing the file in the R session while
  \code{env} corresponds to the \code{local} argument of
  \code{source()}. In all other cases the file is made executable and
  executed.
}
\value{
  \code{rcloud.get.asset}: if \code{as.file=TRUE} then a path to the
  file containing the asset contents, otherwise the asset itself
  (character vector for text content, raw vector for binary content)

  \code{rcloud.execute.asset}: for R assets the evaluation result, for
  all other assets the result of the \code{\link{system()}} call.
}
%\references{
%}
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
