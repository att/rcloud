## RCloud develop branch

### Features

* Feature: `file.R` HTTP entry point added, mandatory parameters:
  `notebook` (notebook ID) and `file` (file name)
  Retrieves a file embedded in a notebook.

* Feature: `by.name.R` HTTP entry point added. It uses `path.info` to
  match a notebook name and (optionally) a file within the
  notebook. If the path matches a notebook name completely, then the
  notebook is called (like `call.R` with all teh arguments). If the
  first part of the path matches a notebook name followed by a slash
  then the rest of the path is taken as a file name to fetch from the
  notebook.

* Feature: the HTTP server supports partial path matching, .i.e,
  `/foo.R/bar/gee` can match `foo.R` file in which case the rest of
  the path is stored in `path.info` and `foo.R` is evaluated. If the
  path is a complete match, `path.info` is `NULL`. In both cases
  `self.path` variable will contain the path that matches the path to
  the script being run.

* Convention: the `call.R` entry point is used for general RPC into R.
  Documentation for notebooks that are intended to be used as `call.R`
  targets should be in the form of RMarkdown cells, so that
  `view.html?notebook=` shows the documentation for
  `call.R?notebook=`. KNOWN BUG: `call.R` currently ignores all
  RMarkdown cells, so if you mix R content into your cells, they will
  currently be ignored.

* Feature: `tmpfile` result type is now supported in
  `rcloud.call.FastRWeb.notebook`

* Feature: File upload now supports upload-to-notebook. When the
  "upload to notebook" checkbox is selected, the file is uploaded
  to the github gist instead of to the local filesystem. As a result,
  it can be seen by anyone, regardless of permissions. This can be
  used to install custom stylesheets (as per feature description
  below)

* Feature: Notebook interests (the set of notebooks you find
  interesting enough to keep close) is now denoted by starring and
  unstarring notebooks. We now explicitly keep the
  user-notebook-starring relation so we can do recsys things with it
  in the future.

* Feature: In view mode (view.html), appending &quiet=1 will hide the
  navbar and greeting message. This makes it easier for view.html URLs
  to be effectively used as iframes in different websites.

* Feature: In view mode (view.html), rcloud inserts any stylesheets
  present in the notebook into the main document. Currently, the only way
  to add stylesheets to a notebook is to directly edit the github
  gist. This will change in the near future.

* Feature: added a `github.user.whitelist` option to rcloud.conf to
  allow only a subset of Github users to login to any given rcloud
  deployment. If no whitelist is given, all users are allowed in

### Bugfixes

* Bugfix: `rcloud.call.notebook` woudl break on arguments with empty
  names (e.g. `?foo` query string when using `call.R`)

## September 19th 2013

* v0.8 release created
