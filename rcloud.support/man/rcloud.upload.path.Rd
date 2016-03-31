\name{rcloud.upload.path}
\alias{rcloud.upload.path}
\title{
  Get file upload location.
}
\description{
  \code{rcloud.upload.path} returns the path for files
  that are uploaded using the RCloud upload user interface.
}
\usage{
rcloud.upload.path(...)
}
\arguments{
  \item{...}{character vector, optional, additional components that
  will be added to the path.}
}
\details{
  When used without arguments it returns the directory where all
  uploaded files go. If additional arguments are used, they consitute
  components that are added to the path - see \code{\link{file.path}}.
}
\value{
  resulting path
}
%\references{
%}
\author{
  Simon Urbanek
}
\examples{
rcloud.upload.path()
rcloud.upload.path("test", "foo.txt")
}
\keyword{manip}
