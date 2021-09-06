\name{rcloud.read.pem}
\alias{rcloud.read.pem}
\alias{rcloud.write.pem}
\alias{rcloud.pem}
\title{
  Read and write encrypted content in PEM format
}
\description{
  \code{rcloud.read.pem} reads content in PEM (Privacy Encanced Mail)
  format into an object that can be typically passed to
  \code{\link{rcloud.decrypt}()}.

  \code{rcloud.write.pem} writes encrypted object in PEM format which
  is text-only and can be easily transported via non-binary media such
  as copy/paste or e-mails.
}
\usage{
rcloud.read.pem(file)
rcloud.write.pem(x, file, append=FALSE)
}
%- maybe also 'usage' for other objects documented here.
\arguments{
  \item{x}{item to store}
  \item{file}{either a connection or a string specifying a file name}
  \item{append}{logical, only used if \code{file} is a file name and
  determines whether append (\code{TRUE}) or overwrite (\code{FALSE})
  mode is used when creating the connection}
}
\details{
  \code{rcloud.read.pem} reads from a file or connection until it
  finds \code{RCLOUD CONTENT} PEM section. Then it decodes the
  section and returns the object. All headers starting with
  \code{Meta-} are stored in the \code{"metadata"} attribute. If an
  open connection was passed then the reading is advanced just past
  the parsed section so further processing is possible (e.g., multiple
  sections are be parsed by repeated calls to \code{rcloud.read.pem}).
  If the connection was not open, it will be opened and closed for the
  duration of the call, i.e., only the first section is returned.

  \code{rcloud.write.pem} writes the object in PEM format using
  \code{RCLOUD CONTENT} section. Entries from the \code{"metadata"}
  attribute are stored as headers with \code{Meta-} prefix. If
  \code{file} is not open connection then it will be opened for
  writing and then closed upon completion.
}
\value{
  \code{rcloud.read.pem} returns \code{TRUE} invisibly on success

  \code{rcloud.write.pem} returns the decoded raw object
}
%\references{
%}
\author{
Simon Urbanek
}
%\note{
%}
\seealso{
\code{\link{rcloud.encrypt}}
}
\examples{
a <- 1:10
key <- PKI::PKI.genRSAkey(2048)

enc <- rcloud.encrypt(a, key)
## show the encrypted object
str(enc)

## write in PEM format
rcloud.write.pem(enc, "test.pem")

## show the output
writeLines(readLines("test.pem"))

## read and decrypt
rcloud.decrypt(rcloud.read.pem("test.pem"), key)

## NOTE: you can use RCloud-managed keys
## in which case you don't need to supply the key
## - see ?rcloud.encrypt

unlink("test.pem")
}
\keyword{manip}
