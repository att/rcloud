\name{rcloud.home}
\alias{rcloud.home}
\title{
  Get path in user's RCloud home directory
}
\description{
  \code{rcloud.home} constructs a path based on user's RCloud home
  directory. Every user in RCloud has a dedicated RCloud home
  directory. That directory is typically different from user's unix home
  as that may not even exist depending on the installation. The RCloud
  home is also the location of the private library that evey RCloud user
  has (\code{rcloud.home("library")}).
}
\usage{
rcloud.home(..., user = if (is.null(.session$exec.usr)) "" else .session$exec.usr)
}
\arguments{
  \item{\dots}{additional path components to append to the RCloud home}
  \item{user}{user for which the RCloud home is retrieved, defaults to
    the current user}
}
%\details{
%}
\value{
  String, full path
}
%\references{
%}
\author{
  Simon Urbanek
}
\seealso{\code{\link{rcloud.upload.path}}}
\examples{
rcloud.home()
rcloud.home("foo", "my_file.txt")
}
\keyword{manip}
