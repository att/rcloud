\name{rcloud.get.asset}
\alias{rcloud.get.asset}
\title{
  Access notebook assets
}
\description{
  \code{rcloud.get.asset} retrieves a notebook asset
}
\usage{
rcloud.get.asset(name, notebook = rcloud.session.notebook(), version = NULL,
                 cached = TRUE, quiet = FALSE, as.file = FALSE)
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
}
\details{
  \code{rcloud.get.asset} loads a notebook and retrieves the asset of
  the name \code{name} from the notebook.
}
\value{
  if \code{as.file=TRUE} then a path to the file containing the asset
  contents, otherwise the asset itself (character vector for text
  content, raw vector fir binary content)
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
