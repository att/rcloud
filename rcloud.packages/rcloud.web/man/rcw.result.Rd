\name{rcw.result}
\alias{rcw.result}
\alias{rcw.inline}
\title{
  Create an RCloudWeb result for display
}
\description{
  \code{rcw.result} creates an object that can be passed out of a
  function in order to be used as in RCloudWeb, typically by
  \code{mini.html} or similar page using an RCloud session.

  \code{rce.inline} can be used to display the result from
  \code{rcw.result} inline inside a cell in RCloud (as opposed to an
  independent page). It performs the same actions as \code{mini.html}.
}
\usage{
rcw.result(run, body, ...)
rcw.inline(result, ...)
}
\arguments{
  \item{run}{function that will be executed with parsed query arguments
    in the document once \code{body} is loaded}
  \item{body}{string, contents to place in the \code{body} DOM element}
  \item{...}{for \code{rcw.result} any other objects that are to be
    passed to the JavaScript side, can also contain functions which become
    JavaScript functions on the other side.
    
    for \code{rcw.inline} any additional arguments taht will be passed
    to the \code{run} function of the result (instead of the parsed query
    string)}
  \item{result}{result from \code{rcw.result} that is to be displayed}
}
%\details{
%}
%\value{
%}
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
