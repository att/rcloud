\name{rcw.set}
\alias{rcw.append}
\alias{rcw.prepend}
\alias{rcw.set}
\alias{rcw.style}
\alias{rcw.attr}
\alias{rcw.css}
\alias{rcw.on}
\alias{rcw.off}
\alias{rcw.in}
\alias{rcw.value}
\title{
  DOM element manipulation functions
}
\description{
  \code{rcw.set} replaces the contents of a DOM element
  
  \code{rcw.append} appends new content to a DOM element

  \code{rcw.prepend} prepends new content before exsiting content of a
  DOM element

  \code{rcw.attr} manipulates attributes of an element

  \code{rcw.value} manipulates value of an element

  \code{rcw.style} is a shorthand for \code{rcw.attr(x, 'style', ...)}

  \code{rcw.css} manipulates CSS properties of an element

  \code{rcw.on} adds an event callback handler to an element

  \code{rcw.off} removes event callbacks

  \code{rcw.in} evaluates an expression in the context of a particular
  element, effectively re-directing all the output into that element.
}
\usage{
rcw.append(element, what)
rcw.prepend(element, what)
rcw.set(element, what)
rcw.attr(element, attribute, value)
rcw.value(element, value)
rcw.style(element, value)
rcw.css(element, property, value)
rcw.on(element, events, callback, data=element, ...)
rcw.off(element, events)
rcw.in(element, expr)
}
\arguments{
  \item{element}{string, jQuery specification of the element in question, see
    details below for some common specifications}
  \item{what}{new content, will be coerced and collapsed to a single
    string}
  \item{attribute}{string, name of the attrbute to get/set}
  \item{value}{if missing the function will retrieve the value, if set
    then the attribute/property will be set using this new value}
  \item{property}{string, name of the CSS prioperty to get/set}
  \item{events}{string, names of the events to register for (e.g.,
    \code{"click"}, \code{"change"}, \code{"submit"} - see jQuery.on
    documentation)}
  \item{callback}{function or ocap preferrably with signature
    \code{function(data, info, ...)} that will be called when the events
    are triggered}
  \item{data}{an additional argument that will be passed to the callback
    function. Note that it is passed to the JavaScript side, so some
    special objects may not be supported.}
  \item{...}{named arguments are treated as \code{event=callback}
    allowing a somewhat more R-friendly syntax. This and specifying
    events directly are mutually exclusive.}
  \item{expr}{expression to evaluate. Note that currently it is
  evaluated in one shot, so it behaves like being inside a function so
  use explicit calls to \code{print()} to display results as desired.}
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

  \code{rcw.attr} manipulates the specified attribute of the DOM
  objects by either retrieving the value (if \code{value} is missing) or
  replacing the content with a new value.

  \code{rcw.value} manipulates the value of the DOM object.

  \code{rcw.style} is a shorthand for \code{rcw.attr(x, 'style', ...)}
  and pertains to the entire style attribute of the element. In contrast,
  \code{rcw.css} is operating on the computed CSS style, so it allows
  the retrieval and modification of individual CSS properies that may be
  actually set by parent elements. Note that CSS provides several ways
  to encode a property value (e.g., color), so the returned computed
  value may not correspond exactly to the set value: e.g.,
  \code{rcw.css("#x", "color", "#000")} may return
  \code{"rgb(0, 0,0)"}. However, \code{rcw.style} will return the value
  as set since it is literally an attribute of the element.

  \code{rcw.on} and \code{rcw.off} register and remove handlers for
  events on the element.
}
%\value{
%}
%\references{
%}
\author{
  Simon Urbanek
}
\examples{
## create a div for content and a button
rcloud.html.out("<div id=info></div><br><input id=button type=button class='btn btn-primary' value='OK'>")

## set the text
rcw.set("#info", "Loading...")

## add a call-back that will be called on a click
rcw.on("#button", click=function(...) rcw.set("#info", "You clicked on me!"))

## ... click on the button and see what happens :)

## let's also change the color on the text randomly
rcw.on("#button", click=function(...)
  rcw.css("#info", "color", sprintf("%06x", as.integer(runif(1)*2^24))))

## ... happy clicking :)


rcw.set("#info", "Ok, no more clicking...")
rcw.css("#info", "color", "black")
## remove the callback
rcw.off("#button")
## and hide the button
rcw.css("#button", "visibility", "hidden")

## let's put a plot in there
p <- WebPlot(400, 400)
plot(1:10, col=2)
rcw.append("#info", p)
rcw.append("#info", "<p><b>Figure 1</b>")
}
%\note{
%}
\keyword{manip}
