\name{rcw.set}
\alias{rcw.append}
\alias{rcw.prepend}
\alias{rcw.set}
\title{
  DOM element manipulation functions
}
\description{
  \code{rcw.set} replaces the contents of a DOM element
  
  \code{rcw.append} appends new content to a DOM element

  \code{rcw.prepend} prepends new content before exsiting content of a
  DOM element  
}
\usage{
rcw.append(element, what)
rcw.prepend(element, what)
rcw.set(element, what)
}
\arguments{
  \item{element}{string, jQuery specification of the element in question, see
    details below for some common specifications}
  \item{what}{new content, will be coerced and collapsed to a single string}
}
\details{
  These functions manipulate the DOM (Document Object Model) that
  represents the page this RCloudWeb session is attached to. A DOM
  element may be anythign like a paragraph, div, button, form etc.

  The \code{element} selection is using jQuery (see Selecting Elements
  in jQuery documentation), most common specifications are:

  \itemize{
    \item{\code{#myId}}{will select the element with \code{id="myId"}}

    \item{\code{.myClass}}{will select the element with
      \code{class="myClass"}}

    \item{\code{tag}}{will sellect all elements of the type \code{tag} (so,
      e.g. \code{"div"} will select all \code{div}s).}
  }

  There are many more selectors in jQuery that are also supported, such
  as by attribute, relationship etc.

  \code{what} is the content to set/add and everything but a JavaScript
  function is converted to single string by using
  \code{paste(as.character(what), collapse="\n")}.
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
