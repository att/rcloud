\name{rcloud.session.notebook}
\alias{rcloud.session.notebook}
\title{
  Access notebook currently loaded in the session
}
\description{
  \code{rcloud.session.notebook} returns the full notebook object of the
  currently loaded notebook.

  \code{rcloud.session.notebook.id} returns the ID (string) of the
  currrently loaded notebook.
}
\usage{
rcloud.session.notebook()
rcloud.session.notebook.id()
}
\details{
  The currently loaded notebook in a session typically corresponds to
  the notebook being edited (in IDE mode) or viewed (in view
  mode). Note, however, that this may not necessarily be the notebook being
  currently executed, e.g., when \code{\link{rcloud.call.notebook}} is
  used then the session is owned by the partent notebook.

  \code{rcloud.session.notebook} may need to request the content of the
  notebook externally and thus is not guaranteed to be instantaneous. 
  
  Both functions will return \code{NULL} if a session has not
  been initialized, e.g., when the RCloud back-end is used to run a
  notebook outside of the IDE.
}
%\value{
%}
%\references{
%}
\author{
  Simon Urbanek
}
%\note{
%}
\keyword{manip}
