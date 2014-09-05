## RCloud 1.2

* Multiple file upload.  File upload interface has been modernized to use
  promises and to split the UI from the back-end.

  `RCloud.UI.upload_with_alerts(to_notebook, options)` takes the place of the old
  functions `rcloud.upload_to_notebook` and `rcloud.upload_file`.  All its UI
  elements are configurable.  By default it will send messages and
  confirmations to the Upload Files pane in edit mode, and to the main output
  div in view mode.  Upload can also be enabled in published notebooks running
  anonymously through the technique [in this
  notebook](https://gist.github.com/gordonwoodhull/8bf3ccc607b4164c8f22).

  In addition, there are lower-level JavaScript upload functions when you
  don't want the use of Bootstrap alerts. `RCloud.upload_files` and
  `RCloud.upload_assets`, which return promises instead of using a callback,
  take a `react` struct for progress messages and overwrite confirmation.


* Delete and edit comments

* CSS highlighting and syntax

* Disabled backspace as a shortcut to the back button to prevent some accidental
  navigation away from RCloud

* The notebook store is now abstrated through the `gist` package,
  allowing arbitrary back-ends. The traditional GitHub Gist backend is
  now handled by the `githubhist` package. Alternative back-end based
  on local git repositories is implemented in `gitgist`. The back-end
  is selected by the `gist.backend` configuration option. It curretnly
  defaults to `githubgist` but it will eventually become a mandatory
  option.

* `notebook.R` allows trailing paths to be processed by the notebook
   code (instead of asset lookup) if they start with `/.self/`. The
   subsequent path part is passed to the `run` function as the
   `.path.info` argument. This allows notebooks to handle full tree
   structure on top of a single notebook URL, .e.g.:
   `https://rcloud.mydomain.com/notebook.R/user/notebook/.self/foo/bar`
   will call the notebook with `.path.info` set to `/foo/bar`. Note
   that the `.self` part distinguishes asset lookup from a path info
   call.


## RCloud 1.1.2

* Set CRAN mirror `repos` option if not already set to avoid interactive
  prompt. The default will be either `CRAN.mirror` entry from `rcloud.conf`
  or `http://cran.r-project.org` if not specified.

* Fix crash on Safari where RCloud would keep trying to open earlier and
  earlier notebooks

* Resizeable side panels.  Temporarily gives you more room to work on assets
  or read help.  Lasts until a panel is opened or collapsed.

* Fixes bug where asset editor did not always size to fit its panel.


## RCloud 1.1.1

* Properly handle failed connections (was throwing in an error handler). Add
  require dependency rserve -> underscore.

* Fix reset links in wdcplot charts.


## RCloud 1.1

* `main.html` has been renamed `edit.html`. Currently main.html
  redirects to edit.html, but this will be eventually removed.

* DEPRECATION: the flat-file backend for [RCS](https://github.com/att/rcloud/wiki/RCS)
  is to be considered deprecated. In future releases we will only
  support the redis backend.

* Cascading style sheets held in assets will only be loaded if
  the filename matches `rcloud-*.css`.

* `rcloud.install.js.module` now takes an optional boolean parameter
  force to force reloading, to help with JS development.

* `view.html` and `main.html` now support referencing notebooks by
  name. Use, for example,
  `view.html?user=cscheid&path=tests/project1/notebook1`.

* Python cells are now supported. They are executed in a separate process
  using IPython. This requires `rpython2` R package from RForge.net
  and corresponding IPython packages in the Python installation.

* RCloud now uses RequireJS for loading JavaScript libraries.  This
  makes it far easier for RCloud packages to use external JS libraries,
  and in particular allows upgrading wdcplot on the fly.  You can also
  use require to load JS libraries stored as assets, by using the link
  in the asset pane.

* Ability to fork any notebook, even if it is your own.  The navbar
  always displays the fork button, and will also show a save button
  if the notebook is yours, or a revert button if the notebook is
  yours on a prior version.  Caution: currently when you fork your
  own notebook, the history is lost; we hope to fix this soon.

* Confirmation dialog on removing a notebook.

* The navbar now displays the notebook author and whether the editor
  is in read-only mode.

* The browser title now includes the notebook name.

* Drag individual files onto the asset pane in order to upload them
  as assets.

* Press cmd-enter or ctrl-enter in the comment area to submit a comment.

* Rename assets by clicking on the filename.

* Lux and dcplot are now "RCloud packages".  They are installed
  automatically by `fresh_start.sh` (and `build.sh`), but any notebooks
  that use `wgeoplot` or `wtour` will need to `require(rcloud.lux)`, and
  andy that use `wdcplot` will need to `require(rcloud.dcplot)`.

* Fixed an issue with arrays in `wdcplot` expressions, and arrays
  can now contain `wdcplot` placeholders (e.g. dataframe columns).

* Fixed an issue where downloaded files were being named `download`.

* Fixed erroneous cell results where there were no cell results.

* The asset editor now has a JavaScript mode.

* Fixed a couple of issues with R code completion.



### Installation/Administration

* RCloud configuration now defaults to using a single port for both
  HTTP and WebSockets. This simplifies many things since there is now
  only one place to configure the port (`rserve.conf`), only one port
  to forward when needed and only one connection to setup TLS for if
  needed. However, it requires more care when using a reverse proxy
  since it has to also proxy WebSocket upgrade requests accordingly.

## RCloud 1.0.1

### Bugfixes

* Fixed issue where nothing would work if no notebooks were starred (#630)

* Fixed bug that prevented code completion from working past the first
  token (#645)

* Fixed issue where typing in the prompt could cause the notebook to
  "bounce" up and down (#634)

* Fixed issue where image width was sometimes getting set to zero (#633)


## RCloud 1.0

### Features

* Major interface update with side panels

* Help panel, showing R help as well as paged output such as `data()`

* Asset editor / scratch pane.  Pressing Cmd-Enter (or Ctrl-Enter) executes
  the current line or selection as a new cell.

* Search notebooks, with notebooks indexed using SOLR

* Session info panel displays stdout/stderr messages, as well as errors.
  Custom messages can be displayed with `rcloud.out`.

* People I Starred tree shows all notebooks of people whose notebooks you
  have starred.  My Notebooks are in a folder just like anyone else's,
  to reduce clutter.

* Notebook is automatically saved when navigating away from the page,
  and when any operation changes the notebook.

* Ability to change cell language

* URL now updated to include notebook ID and version

* Notebook lists and options are now stored with fine granularity in RCS,
  so that multiple sessions are less likely to interfere with each other

* Revamp of JavaScript code to use promises for improved asynchonous
  operation and robustness.  In addition, most JS errors are shown in the
  session info panel.

* Export notebook as R source

* Split and join cells

* Reorder cells by dragging and dropping the handle in the left gutter

* Click to edit source of already=run cells

* Instead of creating a new notebook when deleting the current notebook,
  the most recent notebook is opened

* Change notebook name by clicking on the name in the notebook list or
  the navigation bar

### Bugfixes

* Too many to list


## RCloud 0.9.2

### Features

* RCloud branch and revision are now displayed on startup (#277).
  The `scripts/build.sh` script updates the `REVISION` file used for this.
  Previously, only the distribution script created that file.

* Logout page includes a link to GitHub logout as well (#294)
  Note that the default for `goodbye.page` has changed to `/goodbye.R`

* Users can get a notebook asset by name via the
  `rcloud.get.notebook.asset` function. This is useful for getting to
  files that have been uploaded to the notebook without needing to go
  through the GitHub URL.

* Users can control warnings via the `rcloud.disable.warnings` and
  `rcloud.enable.warnings` functions. This controls warnings for the
  current RCloud session, and is not reset after each evaluation
  (which happens, say, with `options(warn=-1)`). By default, warnings
  are displayed, as before.

* Users can export a notebook as a single R source file via the
  'Export Notebook as R Source File' button in the Advanced menu.

* Users can control echoing via the `rcloud.disable.echo` and
  `rcloud.enable.echo` functions. When echoing is disabled, the
  commands themselves do not appear in subsequent evaluation calls
  (notice that the call to `rcloud.disable.echo` itself still
  appears..) By default, echoing is enabled, as before.
  In addition, the option `&quiet=1` to view.html now calls
  `rcloud.disable.echo()` before any evaluation, mitigating the
  flashing of code described
  [here](https://github.com/att/rcloud/issues/216).

### bugfixes

* Empty markdown cells no longer cause an error (#173)

* Improved notebook update speed when there are many users/notebooks (#264)

* Loads MathJax by HTTPS to allow use in HTTPS deployments (#309)


## RCloud 0.9

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
