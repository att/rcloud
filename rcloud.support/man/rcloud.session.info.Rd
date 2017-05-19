\name{rcloud.session.info}
\alias{rcloud.session.info}
\title{
  Get information about an RCloud session
}
\description{
  \code{rcloud.session.info} retrieves information about an RCloud session.
}
\usage{
rcloud.session.info(id = .session$sessionID, user = .session$username)
}
\arguments{
  \item{id}{session id, defaults to the current session}
  \item{user}{username of the user owning the session, defaults to the
    current user}
}
\value{
  A list with at least the following entries
  \item{id}{session ID (typically a GUID)}
  \item{host}{name of the host running the session}
  \item{script.url}{URL to the script service on that host. Note that
    this is only guaranteed to be valid on the RCloud node, generally it
    cannot be used from a client}
  \item{pid}{process ID of the session}
  \item{uname}{unix username}
  \item{uid}{unix user id}
  \item{gid}{unix group id}
  \item{user}{notebook store username}
  \item{mode}{type of the session (see Details section)}
  \item{start}{timestamp of the session start}
}
%\references{
%}
\author{
  Simon Urbanek
}
\details{
  Each connection to RCloud creates a session. A session is specific to
  a user and running on a specific machine. As such it has all the unix
  properties such as pid, uid, gid. In compute separation setup
  the current session will be the compute session (although the control
  session also exists in parallel).

  The mode of the session determines what kind of session was
  initialized. This allows the notebook to determine how it is being
  run. Althoiugh the mode can be set to anything in the client
  the following modes are most often used in regular RCloud:
  \itemize{
    \item{IDE}{is the mode used by the RCloud UI - both in edit and view
      mode}
    \item{call}{is used when calling a notebook via the
      \code{rcloud.call.notebook} API}
    \item{client}{is used by JavaScript clients (mini, shiny etc.)}
    \item{script}{is used when running RCloud sclipt on the command
      line}
    \item{startup}{should never be seen under normal circumstances -
      this is the initial mode value before the mode is set by the
      connection}
  }  
}
%\seealso{
%}
\examples{
  str(rcloud.session.info())

  # use direct output in IDE and RCloud Web otherwise
  # so that we see output in both cases
  if (rcloud.session.info()$mode == "IDE") {
     rcloud.html.out("<h2>Hello, World!</h2>")
  } else {
     rcloud.web::rcw.result(body="<h2>Hello, World!</h2>")
  }
}
\keyword{sysdata}
