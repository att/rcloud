\name{dev.resize}
\alias{dev.resize}
\title{
Resize device
}
\description{
  \code{dev.resize} changes the size of the device for future
  plots.
}
\usage{
dev.resize(width = 510, height = 510, reset=FALSE, ..., device = RCloudDevice)
}
%- maybe also 'usage' for other objects documented here.
\arguments{
  \item{width}{new width}
  \item{height}{new height}
  \item{reset}{logical, if \code{TRUE} all graphics parameters are
    reset, otherwise they are retained/copied.}
  \item{...}{additional arguments to be passed to the device function}
  \item{device}{function to call for a new device}
}
\details{  
  Currently this function is implemented by closing the previous device
  (if existent) and creating a new one with the specified
  size. Depending on the \code{reset} value graphics parameters (other
  than size) are copied to the new device.

  Note that the new device must be compatible with the old one if
  \code{reset=FALSE} otherwise copying the parameters may fail.
}
\value{
  new device (invisibly)
}
\author{
Simon Urbanek
}
\seealso{
\code{\link{RCloudDevice}}
}
\examples{
plot(1:10)
dev.resize(800,500)
plot(1:10, col=2)
}
\keyword{graphics}
