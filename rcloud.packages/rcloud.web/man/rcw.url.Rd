\name{rcw.url}
\alias{rcw.url}
\alias{rcw.redirect}
\alias{rcw.cookies}
\alias{rcw.parameters}
\title{
  Retrieve properties from the current document
}
\description{
  \code{rcw.url} returns the URL from the current document

  \code{rcw.redirect} changes the URL of the current document
  
  \code{rcw.cookies} returns the cookies from the current document

  \code{rcw.parameters} returns the query string as a parsed list
}
\usage{
rcw.url(detailed = TRUE)
rcw.redirect(url)
rcw.cookies(raw = FALSE)
rcw.parameters()
}
\arguments{
  \item{detailed}{logical, if \code{TRUE} then a full list of various
    components is returned, if \code{FALSE} only the URL string is
    returned}
  \item{new full URL}
  \item{raw}{logical, if \code{FALSE} then the cookies are parsed into a
    named list. If \code{TRUE} then the full cookie string is passed
    as-is which is useful for passing credentials to related services.}
}
%\details{
%}
\value{
  \code{rcw.url} returns a string - the URL - if \code{detailed = FALSE}
  or a list with the components \code{url} (full URL), \code{query},
  \code{path}, \code{origin} amd \code{hash}.

  \code{rcw.cookie} returns a named list of the cookies (\code{raw =
    FALSE}) or the raw cookie string.

  \code{rcw.parameters} parses the query string from the document into a
  list of parameters.
}
\author{
  Simon Urbanek
}
%\note{
%}
\keyword{manip}
