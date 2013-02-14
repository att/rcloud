\name{start.rcloud}
\alias{start.rcloud}
\alias{configure.rcloud}
\title{
  Functions to setup RCloud sessions
}
\description{
  \code{configure.rcloud} configure R session to be used as a server
  instance for RCloud. It is typically executed in Rserve as part of the
  initialization process.

  \code{start.rcloud} initialized client session, typically as part of
  \code{session.init()} executed by the RCloud client.
}
\usage{
   configure.rcloud()
   start.rcloud(username="", ...)
}
\value{
  Both functions return \code{TRUE}
}
\details{
  \code{configure.rcloud} respects several environment variables that
  define the location of the RCloud directories:

  \code{ROOT} defines the root of the RCloud setup. It is mandatory.

  \code{CONFROOT} defines the configuration directory, defaults to
  \code{$ROOT/code}

  \code{DATAROOT} defines the data directory, defaults to
  \code{$ROOT/data}

  Other noteworthy directories:

  \code{$ROOT/tmp} - temporary directory for the sessions

  \code{$DATAROOT/userfiles} - pre-user files

  \code{$DATAROOT/history} - history
}
\author{
  Simon Urbanek, Carlos Scheidegger
}
\keyword{manip}
