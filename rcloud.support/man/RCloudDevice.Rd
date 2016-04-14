\name{RCloudDevice}
\alias{RCloudDevice}
\title{
  Creates an RCloud graphics devices
}
\description{
  \code{RCloudDevice} creates a new RCloud graphics device. This is
  the default device in RCloud and it is implicitly created when plots
  are started in RCloud. Calling this function explicitly allows the
  user to change dimensions and properies for plotting.
}
\usage{
RCloudDevice(width, height, dpi = 100, ..., type = "inline")
}
\arguments{
  \item{width}{initial width in pixels}
  \item{height}{initial height in pixels}
  \item{dpi}{display resolution (in dots per inch)}
  \item{type}{device type that is passed to the user
  interface (client browser). Currently only the type of
  \code{"inline"} is implemented.}
}
%\details{
%}
\value{
  object of the class \code{"RCloudDevice"}
}
%\references{
%}
\author{
 Simon Urbanek
}
\seealso{
\code{\link{dev.new}}, \code{\link{dev.set}}
}
\examples{
  RCloudDevice(900, 400)
  plot(rnorm(100), pch=19, col=2)
}
\keyword{device}
