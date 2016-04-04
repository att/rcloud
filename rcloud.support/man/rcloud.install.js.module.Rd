\name{rcloud.install.js.module}
\alias{rcloud.install.js.module}
\title{
  Create a JavaScript module
}
\description{
  \code{rcloud.install.js.module} creates a JavaScript module by
  evaluating JavaScript code and returning bindings from R to
  the module.
}
\usage{
rcloud.install.js.module(module.name, module.content, force = FALSE)
}
\arguments{
  \item{module.name}{string, name of the module. Can be arbitrary but
  should be unique for each module.}
  \item{module.content}{JavaScript code sonstituting the module code
  on the JavaScript side - see Details below.}
  \item{force}{logical, if \code{TRUE} existing bindings for the same
  module will be overwritten, if \code{FALSE} then no action is
  performend if the module already exists.}
}
\details{
  A JavaScript module is created by suppplying valid JavaScript code
  which evaluates into an object/dictionary. That dictionary is
  returned in R convering all JavaScript obejcts into R
  objects. JavaScript functions are returned as R functions invoking
  the corresponding JavaScript function they reference.
}
\value{
  list of objects defined by the JavaScript code of the module
}
%\references{
%}
\author{
  Gordon Woodhull, Simon Urbanek, Carlos Scheidegger
}
%\note{
%}
%\seealso{
%}
\examples{
  o <- rcloud.install.js.module("test",
       "({ 'alert': function(x, k) { alert(x); k() } })")
  o$alert("Module installed!")
}
\keyword{interface}
