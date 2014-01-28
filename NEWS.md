## RCloud develop branch

### Features

* RCloud now supports anonymous access to with user switching.
  When user switching is enabled (`Exec.auth`), then execution
  token will be honored even without GitHub tokens. In addtion,
  fully anonymous access (no tokens at all) will be allowed if
  `Exec.anon.user` configuration is set and anonymous users
  will switch to that account.

* There is now a deployment script `scripts/mkdist.sh` which
  takes the current checkout, computes and downloads all dependency
  packages and creates a distribution tar ball containing a repository
  of dependend packages and the RCloud distribution.

* Feature: `notebook.R` HTTP entry point added. It uses `path.info` to
  match a notebook name and (optionally) a file within the
  notebook. Possible uses:

         /notebook.R/<notebook-hash>
         /notebook.R/<notebook-hash>/<version-hash>
         /notebook.R/<notebook-hash>/<filename>
         /notebook.R/<notebook-hash>/<version-hash>/<filename>
         /notebook.R/<user>/<notebook-name>
         /notebook.R/<user>/<notebook-name>/<filename>

  To avoid ambiguity usernames should not match exactly `[0-9a-f]{20}`
  and filenames should not match exactly `[0-9a-f]{40}` since hashes
  have higher priority than names.

  All above uses that end with `<filename>` will attempt to fetch the
  file of that name from the notebook. All other uses call the
  corresponding notebook, i.e. return the evaluation result.

  KNOWN BUG: `notebook.R` currently ignores all RMarkdown cells, so if
  you mix R content into your cells, they will currently be ignored.

  NOTE: notebook.R supersedes call.R, file.R and by.name.R that
  existed in the development version performing partial opeartions.

* Convention: the `notebook.R` entry point is used for general RPC
  into R. Documentation for notebooks that are intended to be used as
  `notebook.R` targets should be in the form of RMarkdown cells, so
  that `view.html?notebook=X` shows the documentation for
  `notebook.R/X`.

* Feature: the HTTP server supports partial path matching, .i.e,
  `/foo.R/bar/gee` can match `foo.R` file in which case the rest of
  the path is stored in `path.info` and `foo.R` is evaluated. If the
  path is a complete match, `path.info` is `NULL`. In both cases
  `self.path` variable will contain the path that matches the path to
  the script being run.

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

* Notebooks can be stored to "stashes" via `rcloud.stash.notebook()`
  and then deployed in a read-only RCloud instance by using
  `gist.deployment.stash` directive in `rcloud.conf` instead of
  a GitHub back-end. Such service instances only support `view` and
  `notebook.R` access.
  Stashes are stored in RCS and helper functions `rcloud.extract.stash()`
  and `rcloud.restore.stash()` can be used to transfer stashes from a
  regular RCloud instance to a service depolyment instance.


### Bugfixes

* Bugfix: `rcloud.call.notebook` would break on arguments with empty
  names (e.g. `?foo` query string when using `notebook.R`)

## September 19th 2013

* v0.8 release created
