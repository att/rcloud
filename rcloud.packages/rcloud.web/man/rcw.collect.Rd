\name{rcw.collect}
\alias{rcw.collect}
\title{
  Collect a FastRWeb result so it can be set as a content.
}
\description{
  \code{rcw.collect} collects all FastRWeb resutls that have been
  generated since the last call to \code{rcw.collect} and retruns it as
  a string that can be used in \code{\link{rcw.set}} and other DOM
  manipulation functions.
}
\usage{
rcw.collect()
}
\details{
  FastRWeb output functions (\code{out}, \code{otable}, \code{WebPlot},
  ...) accumulate results in an internal buffer. \code{rcw.collect}
  retrieves the contents of the buffer and flushes it such that FastRWeb
  can be used to generate contents for RCloudWeb function like
  \code{\link{rcw.set}}.
}
\value{
  string, all accumulated FastRWeb results.
}
%\references{
%}
\author{
  Simon Urbanek
}
%\note{
%}
\seealso{
\code{\link{rcw.set}}
}
%\examples{
%}
\keyword{manip}
