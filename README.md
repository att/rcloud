# RCloud: Integrated Exploratory Analysis, Visualization, and Deployment on the Web

[![Build Status](https://travis-ci.org/att/rcloud.svg?branch=develop)](https://travis-ci.org/att/rcloud)

RCloud is an environment for collaboratively creating and sharing data
analysis scripts. RCloud lets you mix analysis code in R, HTML5, Markdown, Python, and others.
Much like [Sage](http://www.sagemath.org/),
[iPython notebooks](http://ipython.org/ipython-doc/stable/interactive/notebook.html)
and [Mathematica](http://www.wolfram.com/mathematica/), RCloud
provides a notebook interface that lets you easily record a session
and annotate it with text, equations, and supporting images.

Unlike these other systems, RCloud:

* lets you easily browse and search other users's notebooks. You can
  comment on notebooks, fork them, star them, and use them as function
  calls in your own notebooks.
  
* lets you interpret notebooks as web services: your exploratory data
  analysis are one step away from an automated dashboard.

* provides an environment in which R packages can create rich HTML
  content (using, for example, [d3](http://d3js.org) and
  [dc.js](http://dc-js.github.io/dc.js/)).

* provides a transparent, integrated version control system. In
  essence, RCloud never forgets what you did. If you need low-level
  access to RCloud notebooks, you can simply clone the associated git
  repository. This is because RCloud notebooks are
  [Github gists](https://gist.github.com)

Interested? Read the [setup guide](doc/INSTALL.md).

