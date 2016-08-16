\name{rcloud.download.file}
\alias{rcloud.download.file}
\title{
  Cause the browser to download a file
}
\description{
  \code{rcloud.download.file} invokes a file download in browsers that
  support it.
}
\usage{
  rcloud.download.file(filename, content, mimetype)
}
\arguments{
  \item{filename}{filename of the download}
  \item{content}{string or raw binary content to put in the file}
  \item{mimetype}{a standard mime type to associate with the file, e.g.
    \code{"text/plain"} or \code{"image/png"}}
}
\details{
  \code{rcloud.download.file} sends a payload to the browser and causes
  the browser to download it under the specified \code{filename}.
}
%\value{
%}
%\references{
%}
\author{
  Gordon Woodhull
}
\note{
  Not all browsers allow invoking a download programmatically; in
  particular Safari may open the content in the same window. See
  \url{https://github.com/eligrey/FileSaver.js/} for a list of
  compatibility issues.
}
%\seealso{
%}
%\examples{
%}
\keyword{manip}
