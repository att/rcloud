\name{rcloud.html.out}
\alias{rcloud.html.out}
\title{
  Direct output of HTML content to a cell.
}
\description{
  \code{rcloud.html.out} passes output directly to a cell such that it
  will be interpreted as HTML content.

  Note: for regular output that is supposed to be quoted use
  \code{\link{print}} or \code{\link{cat}} just like in the console.
}
\usage{
rcloud.html.out(..., sep = "")
}
\arguments{
  \item{\dots}{content to print. Subsequent arguments will be
    concatanated just like in \code{\link{paste}}.
  }
  \item{sep}{separator to use between arguments}
}
%\details{
%}
\value{
  Output content (invisibly)
}
%\references{
%}
\author{
  Simon Urbanek
}
\note{
  \code{rcloud.html.out} is guaranteed to work only in IDE and view
  modes. Modules have to implement \code{"html.out"} OOB handler to
  recieve this output and handle it accordingly.
}
%\seealso{
%}
%\examples{
%}
\keyword{manip}
