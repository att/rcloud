\name{rcloud.html.out}
\alias{rcloud.html.out}
\alias{rcloud.out}
\title{
  Direct output functions in RCloud
}
\description{
  \code{rcloud.html.out} outputs content as-is directly into the current
  cell, typically to create HTML content.

  \code{rcloud.out} evaluates and expression and sends the output into
  the R console.
}
\usage{
rcloud.html.out(..., sep = "")
rcloud.out(expr, terminate = "\n")
}
\arguments{
  \item{\dots}{any strings to output}
  \item{sep}{string separator}
  \item{expr}{expression to evaluate}
  \item{terminate}{string to use to terminate the output}
}
\details{
  \code{rcloud.html.out} pastes \dots together using separator
  \code{sep} and collapsing the result using \code{"\n"} and appends the
  resulting string as-is in the cell output. It means that nothing is
  escaped such that HTML-tags can be used and will interpreted by the
  browser. This allows creating out DOM objects and any other arbitrary
  HTML.

  \code{rcloud.out} evaluates the expression (in parent frame) and
  prints the output (if visible) into the RCloud console. In interactive
  use it is mostly equivalent to regular \code{print()}, but in
  non-interactive use or special cases (e.g. inside \code{sink()} or
  \code{capture.output()}) it makes sure that the output explicitly sent
  to the client side as console output.
}
\value{
  Both functions return the resulting string invisibly
}
%\references{
%}
\author{
  Simon Urbanek
}
\examples{
  rcloud.html.out("<b><font color=red>Bold RED text!</font></b><br>")
  rcloud.out(str(iris))
}
\keyword{print}
