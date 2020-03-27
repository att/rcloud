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
  \item{filename}{string, name of the file as reported to the browser
  or if \code{content} is missing path to a file to send}
  \item{content}{string or raw binary content to put in the file. If
  not specified, the file specified by \code{filename} will be
  retrieved using \code{readBin()}}
  \item{mimetype}{optional string, a standard mime type to associate
  with the file, e.g. \code{"text/plain"} or \code{"image/png"}. If
  missing, mime type will be inferred from the \code{filename} using
  \code{\link{mime::guess_type()}}}
}
\details{
  \code{rcloud.download.file} sends a payload to the browser and causes
  the browser to download it under the specified \code{filename}.

  If \code{content} is missing then \code{filename} is interpreted as
  a path to a file in the local filesystem whihc will be read as
  content and the name of the file is retained for the browser to use.
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
