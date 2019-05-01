## RCloud 2.0.3

### Improvements
 * `shared.R` can look in `www/`, `lib/`, or `htmlwidgets/` folders of packages, for
   compatibility with the latest widgets
 * Other languages are enabled only in IDE mode, since only R is supported for mini.html,
   Shiny, flexdashboard, etc. This speeds up loading of dashboards.

RCloud 2.0.2 fixes the build artifacts of 2.0.1


## RCloud 2.0.1

### Bugfixes
 * `Content-disposition` field is passed through `proxy.R`, allowing Shiny's `downloadHandler` to
   specify the filename. (rcloud.shiny#28)


## RCloud 2.0
RCloud 2.0 is compatible with R 3.5. (Due to unknown reasons, R 3.4 was not compatible.)

### Features
 * RCloud now uses Jupyter for Python language support, and supports arbitrary Jupyter language
   kernels. This means the latest versions of Python (2.7.15, 3.6.5) are supported as separate
   kernels, as well as new languages like Julia, Scala, and Java. Any Jupyter kernel just needs to
   be configured with metadata such as the corresponding Ace editor syntax highlighter. See the
   [rcloud.jupyter](https://github.com/att/rcloud/tree/develop/rcloud.packages/rcloud.jupyter)
   package for configuration details (#1378, #1334, #2565)
 * Support for Shiny in flexdashboard (rcloud.flexdashboard#20)

### Improvements
 * Performance improvements to notebook output. Notebook autoscrolling now works reliably and is
   enabled by default. (Disable in Settings pane if you run into trouble.) (#2551, #2552)
 * Visual and functional improvements to Dataframe viewer panel: tighter layout, sticky headers,
   control over paging size. (#2554)

### Bugfixes
 * Assets are maintained in sorted order (#388)


## RCloud 1.9.1

### Features
 * Color coding of the items in the recent notebooks menu, to see at a glance which
   notebooks were opened in the same session. (A session is defined as a period of
   activity with 8 hours separating it from other sessions.) (#2462)

 * Autoscrolling of output in the notebook pane - when output from the current cell
   would leave the screen, the notebook scrolls instead. This feature is still
   experimental, and is disabled by default - please try it out in the Settings pane
   and provide feedback! (#2222)

 * Import and export of Jupyter notebooks, via the new
   [rcloud.jupyter.notebooks](https://github.com/att/rcloud.jupyter.notebooks)
   package. (#2458)

### Improvements
 * Play button is split into Play and Stop buttons, to avoid accidentally restarting
   the session and provide a cleaner, simpler interface. (#2442)

 * Recent notebooks menu fits the height of the browser window (#2532)

 * Hover over recent notebooks to see the date opened

 * Incremental search for multiple terms searches for all the terms using AND (#2518)

 * Support for Shiny showcase display mode, for simple debugging of reactive
   events. Built-in R debugging also shows the source cell name. (rcloud.shiny#23)

 * Easier to maintain a solr search index when solr is restarted (rcloud.solr#86)

### Bugfixes
 * New notebooks were shown as hidden (#2538)

 * Incremental search did not regard username (#2517)

 * Long cells were not indexed by `rcloud.solr` (#2547)

 * Hidden and private notebooks were not removed from Search, and displayed an error
   (#2533)

 * `rcloud.delete.asset` now works (#2420)

 * Joining cells of arbitrary languages should always produce the expected language
   (#2361)

 * Help wouldn't be found if there was leading or trailing whitespace in the input
   (#1760)

 * Editing a running cell would cause its output to disappear once autosave kicked in
   (#2529)

 * Components moved out of JS global namespace that were causing incompatibilities with
   other packages (#2524)


## RCloud 1.9

### Features
 * New implementation of notebook search (in `rcloud.solr` package), with improved
   robustness, ability to constrain by language and asset type, and sensible pagination
   for notebooks from multiple sources.

 * Sorting of notebook tree by date (#522)

 * Filtering of notebook tree by date, i.e. showing only notebook modified in the last
   week or month (#1817)

 * Incremental search of notebooks by name (#2391)

 * Dataframe viewer is paginated, via [DT](https://rstudio.github.io/DT/)

 * Case-sensitive and whole-word search in notebooks (#2425)

### Improvements

 * Autocompletion of multiple languages in RMarkdown/Markdown cells (#2429)

 * Scrolling and more in recent notebooks menu (#2423)

 * <kbd>ctrl click</kbd> or <kbd>cmd click</kbd> on the fork button opens the forked
   notebook in a new tab, without killing the current session (#2441)

 * <kbd>alt click</kbd> a notebook in the Recent Notebooks menu to open it in View mode (#2424)

 * Pressing <kbd>tab</kbd> on editable fields like notebook names and asset names
   accepts the value instead of cancelling (#2440)

 * Build script will fail if you don't have npm, unless you specify
   `--no-js`. Previously the warning would get buried. (#2438)

 * Login page (`rcloud.html`) is included in RCloud distribution

### Bugfixes
 * R Autocompletion works the same as on the R command line, fixing various issues with
   duplicated text (#645), path completion (#1645) etc. Autocomplete dialog is
   autosized so that items are not truncated (#1635).

 * Some concurrency issues were fixed where an earlier version of a cell could be run
   (#2303) or cells could be run out of order (#2513) if the user interacted with a
   notebook while it was saving.

 * Improved error reporting when cell contains an illegal character (#2396)

 * When an invalid source was specified in URL, the valid notebook sources were not
   shown and the page hung (#2444)

 * History of hidden notebooks had inconsistent coloring (#2496)

 * Hide notebook button looked disabled (#2510)

 * Recent notebooks menu was behind notebook sizer (#2463)

 * Pull and Replace dialog was not cleared (#2377)


## RCloud 1.8.1

### Feature
* When using [rcloud-gist-services](https://github.com/att/rcloud-gist-services) as the
  notebook backend, it is possible for multiple users to collaborate on a set of
  notebooks, by putting those notebooks under a shared virtual user id.

### Improvements
* `rcloud.shiny` is now self-contained in its own package - `/shiny.html`
  forwards to `shared.R/rcloud.shiny/shiny.html`

### Bugfixes
* dataframe viewer would crash the UI if the dataframe had only one column (#2445)


## RCloud 1.8

See the news for
[rcloud.htmlwidgets](https://github.com/att/rcloud.htmlwidgets/blob/master/NEWS.md),
[rcloud.shiny](https://github.com/att/rcloud.shiny/blob/master/NEWS.md),
[rcloud.rmd](https://github.com/att/rcloud.rmd/blob/master/NEWS.md), and
[rcloud.flexdashboard](https://github.com/att/rcloud.flexdashboard/blob/master/NEWS.md)
for compatibility improvements.

### Feature
* New [rcloud-gist-services](https://github.com/att/rcloud-gist-services)
  backend, as a replacement for the GitHub Gist API.<br>
  Notes:
  * The options `github.*.url` in
  [rcloud.conf](https://github.com/att/rcloud/wiki/rcloud.conf) no longer
  default to github.com
  * rcloud-gist-services does not yet support a web interface, so Open in
  GitHub is not yet available for this backend (#2402)
  * See Bugfixes for a list of issues where the GitHub API was not appropriate
    for RCloud

### Improvements
* Asset sizes are limited to 2.5MB to avoid performance problems. Notebook
  assets are only appropriate for small amounts of data, scripts, graphics,
  etc. Larger data files should be read from disk.

* Ability to hide all cell results or selected cell results (#2334)

* When selecting a view type from the shareable link menu, the link is opened in
  a new tab just like clicking the button (#1755)

* When there is only one cell selected, clicking it deselects it; i.e. single
  selection works as a toggle (#2404)

* Ability to run only selected cells, by <kbd>ctrl</kbd> / <kbd>cmd</kbd> -
  clicking the Play button (#2403)

* `rcloud.html.out`, `rcloud.out`, `rcloud.home` are documented (#2372, #2400)

* New, optional configuration option `solr.post.method` allows to
  change the way SOLR POST update requests are issued. It can have one
  of the values `async` (default in RCloud 1.8: asynchronous, internal
  httr), `sync` (synchronous, internal - used in RCloud 1.7) or `curl`
  (asynchronous external `curl` command). In the last case another
  option `solr.curl.cmd` can be used to change the default invocation
  of `curl`.


### Bugfixes
* [rcloud-gist-services](https://github.com/att/rcloud-gist-services) fixes some
  issues we were seeing with GitHub Gist:

  * You are now allowed to fork another user's notebook more than once (#1712)

  * When you fork your own notebook, history is now preserved (#702)

  * We were experiencing race conditions when deleting or adding cells very
    quickly, resulting in commits being lost. (#32)

  * Names of forked notebooks now do not conflict; when forking, they are always
    given a unique number if the user already has a notebook with that name
    (#236, #703). Due to the above race condition, we can not fork and then
    immediately rename with GitHub Gist.

* When trying to load a notebook and the session has dropped, the selected
  notebook should still be loaded (#2139)

* Recent notebooks should be shown when initial notebook fails to load (#2369)

* Notebook should be saved when clicking Sharable Link (#2371)

* Name of notebook in "forked from" link was not getting updated when the
  notebook name changed (#1716)

* Clicking in wrong part of recent notebooks menu could cause the notebooks
  panel to minimize (#2414)

* Only the specific notebooks should fail if some of the notebooks specified to
  Import External Notebooks are invalid (#2209)

* Was not able to copy text from the assets of read-only notebooks (#2401)

* Upload button should be disabled when no files are selected (#2390)


## RCloud 1.7.1

### Improvements
* Solr index update calls are non blocking (Requires R 3.3.x)

* Make keys for multiple cell deletion safer by changing the Windows shortcuts
  to <kbd>ctrl del</kbd> / <kbd>ctrl backspace</kbd>, and MacOS shortcut to
  <kbd>cmd backspace</kbd> shortcuts. Make it harder to accidentally hit the
  Undo shortcut by adding the <kbd>alt</kbd> modifier (now <kbd>ctrl alt
  z</kbd> on Windows/Linux and <kbd>cmd alt z</kbd> on MacOS, Redo is
  unaffected). (#2383)

* Arrow keys to move between cells are more conservative. Arrow left/right
  never go to previous/next cell. Arrow up/down first go to beginning/end of
  line before going to previous/next cell. (#2381)

### Bugfixes
* Fix scrolling issues on cell focus, by updating Ace to 1.2.6 (#2379, #2380)

* Markdown cells would switch to GCC Machine Description if they contained
  certain content, making notebook unusable (#2178)

* The `args` argument in `rcloud.call.notebook` was always treated as
  a list, making it impossible to use it as a target environment.

* Help now works for packages in private libraries as well (#2394)

### Features

* `rcloud.web` has been significantly expanded to allow manipulation
  of the elements, styles, CSS (`rcw.attr`, `rcw.style`, `rcw.css`) as
  well as registration of event handlers (`rcw.on`, `rcw.off`) and
  evaluation in the context of an element (`rcw.in`). In addition, it
  provides functions related to the current document to retrieve URL,
  cookies and facilitate re-direction: `rcw.url()`, `rcw.cookies()`
  and `rcw.redirect()`.

* `rcloud.execute.asset` has a parameter `env=` that can be used for R
  assets to specify the environment in which to source the asset.

## RCloud 1.7

In addition to the below changes to RCloud core, this release also supports
the following RStudio compatibility packages:

* **rcloud.shiny** 0.4 should be 100% compatible with native Shiny, including
  file download, data tables, and embedding HTML Widgets in Shiny dashboards.

* **rcloud.flexdashboard** 1.0 supports dashboards using the flexdashboard
  package, through the new `flexdashboard.html` selection in the View Types

* **rcloud.rmd** supports import and export of notebooks to the RStudio R
  Notebook dialect of RMarkdown, including a "Publish to RCloud" action in the
  RStudio Addins menu.

### Features
* Pull and replace contents of notebook. It can be helpful to pull the current
  contents of another notebook and replace the current contents when
  maintaining multiple "branches of development" , or when collaborating on a
  notebook, . Pull and Replace from notebook (in the Advanced menu) allows you
  to pull from another notebook on the same RCloud instance, or from a
  file. It creates a new version, and it can be undone if needed. (#2285)

* Arrow up and down (or left and right) between cells when at the beginning or
  end of a cell. (#2007)

* Option to clear the R session when running the whole notebook (active by
  default). (#1734)

* New configuration option `Welcome.info` allows runtime-specific
  content to be added to the welcome message on login. For example,
  ``Welcome.info: on `hostname` `` will show the host used.

* Added `dev.resize()` function for easy resizing of RCloud plots

### Improvements
* Exporting the notebook to a file or an R source file now exports only the selected
  cells, by default. You can control this behavior using the "Export only selected cells"
  option in Settings. (#1880)

* To better encapsulate its dependencies, HTML Widgets support is now in a
  separate package `rcloud.htmlwidgets`. It is recommended to add this package to
  the `rcloud.alluser.addons` config, as shown in `rcloud.conf.samp`. (#2243)

* Ability to open mini.html notebooks by name using `&user=...&path=...`
  URLs. (#1034)

* Preview PDF files in assets. (#2008)

* Closing the find/replace dialog leaves the current match selected (if the
  notebook is editable). (#2204)

* View type of a forked notebook is the same as the source of the fork (#2288)

* Keyboard shortcuts <kbd>f3</kbd> / <kbd>shift f3</kbd> (Windows/Linux) and <kbd>cmd g</kbd> /
  <kbd>cmd shift g</kbd> for find next / find previous match. (#2192)

* Keyboard shortcuts <kbd>alt r</kbd> for replace current match, <kbd>alt a</kbd> for
  replace all matches (#2129)

* Changing a cell's language leaves the focus in that cell (if the notebook is
  editable). (#2206)

* ESC loses the keyboard focus for the asset pane. (#2221)

* shiny.html/mini.html would sporatically fail with `_` undefined. (#2348)

* session pane output is limited to 10K in order to improve responsiveness and
  possible crashes when there is a huge amount of output (#1997)

### Bugfixes
* Attempting to anonymously open notebooks by name would fail with a missing
  function error.

* Find/Replace dialog could show NaNs when the find text was not
  found. (#2248)

* Exported encrypted notebooks would cause a variety of problems, so this is no longer
  allowed (#1885, #2322, #2343) - in the future we may confirm and decrypt (#2354)

* Could not paste into find dialog. (#2308)

* Find result was obscured by the current text selection. (#2130)

* Find/Replace dialog could get stuck open on Firefox. (#2215)

* Find/Replace count was not always shown on Firefox. (#2213)

* Find highlights were incorrect on reopening the Find dialog. (#2299)

* Pressing right arrow or end shortcut while editing the notebook title cancelled the edit
  in Firefox. (#1988)

* Could not click to position cursor in notebook title or asset name on Firefox. (#2312)

* Uploading an unknown file type could cause the file to be downloaded. (#2008)

* Revert shortcut was shown when not appropriate (#2220)

* Part of the find input was not clickable (#2286)

* Could not close find dialog if there were matches and the last cell was deleted while dialog was open. (#2304)

* Current notebook was unloaded and unrunnable if loading another notebook failed (#2258)

* Plots displayed via the output context were not showing in mini.html (#2278)


## RCloud 1.6.1

### Features
* `rcloud.download.file` invokes a file download in browsers that support
  it. See
  [this notebook](https://rcloud.social/edit.html?notebook=1aafc8129d835a9527e87630109c3df9)
  for a simple example downloading text from a notebook, and
  [this notebook](https://rcloud.social/edit.html?notebook=0f7e6a325bb9158ed01a864ca7f4f175)
  for an example of downloading both text and binary files from a mini.html notebook.

* New, easier methods for adding thumbnail images for the discover
  page. Thumbnails can be pasted, dragged, uploaded from a file, or selected
  from any plot in the notebook. (#2078, #2217)

* Button to clear the session pane. (#1734)

* Docker configuration is included in the source.

### Improvements
* HTML Widgets load faster. (#2231)

* By popular demand, the Delete Cell button is replaced. (#2176)

* Disconnection in anonymous mode should reload, not attempt to log in (#2237)

* Clicking on the RCloud logo navigates to the Edit page. (#2186)

* Times on discovery page are shown relatively (time ago). (#2150)

* Newly imported notebooks are highlighted in the Notebook Tree. (#1431)

* Discover page launches in a new tab. (#2184)

* Number of cells selected is displayed in the Selection Bar. (#2189)

* Session pane will not autoscroll if it is not currently showing the last
  line. (#1996)

### Bugfixes
* Imported notebooks were not showing on discover page. (#2183)

* Clicking "cancel" on the New Asset dialog was throwing an error. (#2171)

* Cells could overlap tall plots. (#1841)

* Starred deleted notebooks were not shown in the All Notebooks tree.
  (#2165 / #2160 / #2194)

* Image assets could overflow the div in Firefox (#2201)

* Disabled asset pane would still grab the keyboard focus, causing keyboard
  shortcuts not to work. (#2218)

* Title/tooltips shown for most buttons in the UI, text adapting where
  appropriate. (#1438 etc.)

* Image assets in encrypted notebooks were displayed as garbage text, when opened
  in a separate window. (#1893)


## RCloud 1.6

### Features
* Multiple cell selection. There is a checkbox on each cell, and a new
  selection bar at the top of the notebook. You can also click cell titles to
  select cells (with the usual extend selection behavior for <kbd>shift</kbd>
  and <kbd>ctrl</kbd>/<kbd>cmd</kbd> clicking). The selection bar allows
  select all or none, and inverting the selection. Click the trashcan (now on
  the selection bar) or press the delete key to delete the selected cells;
  press <kbd>ctrl k</kbd>/<kbd>cmd k</kbd> to "crop" or keep only the selected
  cells; <kbd>ctrl shift i</kbd>/<kbd>cmd shift i</kbd> to invert the
  selection. (#658)

* RCloud now supports many keyboard shortcuts. Press <kbd>?</kbd> with the
  focus on the window in order to see a complete list of shortcuts (or click
  the link in the Help panel). Of note are <kbd>ctrl shift enter</kbd> to run
  the entire notebook (#2001), and <kbd>ctrl shift <</kbd> and <kbd>ctrl shift ></kbd>
  to go to the next or last cell (among many others). (#300) The shortcut help
  dialog also shows shortcuts for the cell/asset/prompt editor. (#1870)

* New Discovery Page to show most recent and most popular notebooks. You can
  add thumbnails to your notebooks to be displayed in this view by adding a
  PNG asset named `thumb.png`. Recent shows the most recently modified
  notebooks; Popular shows notebooks ranked by forks plus stars. Suggestions
  for other recommendation metrics are welcome!

* [HTML widgets](http://htmlwidgets.org) for visualization are now supported in
  notebooks and in mini.html dashboards. (#1435)

* Support `exec.auth: as-local` configuration option which uses
  current unix user (i.e., the user running the RCloud server) without
  authentication as the notebook user. It is intended for single-user
  local installations with gist back-ends that don't provide OAUTH
  authentications (such as gitgist).

* Add support for serving files from user libraries via
  `shared.R/<user>/<package>`. This allows users to develop packages
  that use `shared.R` in their own library until it is ready to be
  released globally. Note that users are still responsible for setting
  the permissions on the library path - the default permissions are to
  not allow others (including the web server) access to user libraries.

### Improvements
* Cells are shown at the full height of all their text, instead of adding a
  second level of scrolling. This eliminates the behavior where they would
  suddenly get smaller when activated, and the cursor usually lands at the
  place that was clicked, or at least not too far away. (#1624)

* The initial page load for `edit.html` is much faster, due to loading the
  notebook tree asynchronously. We will continue to optimize the page
  load. (#1781)

* Panels are distributed to the left and right side based on their width, so
  that the notebook area doesn't get too small. If the old "layout by purpose"
  is wanted, uncheck "Arrange panels by size" in the Settings panel.
  (#1802 / #447)

* Run from this cell to the end of the notebook by <kbd>shift</kbd>-clicking
  the play button, or pressing <kbd>alt shift enter</kbd> within the
  cell. (#1949)

* Stylesheets for reasonable styling of print/PDF output (#1783)

* One particularly useful set of keyboard shortcuts are undo and redo
  (<kbd>ctrl z</kbd>/<kbd>cmd z</kbd> and <kbd>ctrl y</kbd>/<kbd>cmd shift
  z</kbd>) to move forward and backward in history. Then press <kbd>ctrl
  e</kbd> / <kbd>cmd e</kbd> to revert, or the Revert button in the navbar, to
  commit the change. These shortcuts only work when the cells, assets, and
  command prompt are not in focus.

* Numerous improvements to find and replace. In particular, the number of
  results are shown and the first result starts highlighted, and you can press
  <kbd>shift enter</kbd> to reverse-search. It is much harder to get in a
  state where the search results don't match the current state of the
  notebook, at least on browsers that are not Firefox. (#1720 / #2082 / #1849
  / #1960 / etc.)

* Navigating to `edit.html` when not logged in redirects you to the login
  page, or reinitializes the access token, instead of displaying an Aw, Shucks
  error message for something that is not an error. (#2122)

* Errors in mini.html and shiny.html are displayed in a dialog (instead of
  only appearing in the debug console). (#1766)

* Warn when forking a notebook a second time has no effect, due to GitHub's
  policy of returning the same notebook when forked again (#1715)

* Display an unambiguous error when trying to run RCloud on IE or Edge, which
  are currently unsupported. (#1845)

* Display a list of valid notebook sources if an invalid source is specified
  in the URL. (#2004)

### API changes
* `notebook.R` passes an additional entry `.headers` containing the request
  headers.

### Bugfixes
* <kbd>ctrl</kbd>/<kbd>cmd</kbd>-clicking on the New Notebook button opens a
  new tab with a new notebook (#1733)

* <kbd>ctrl</kbd>/<kbd>cmd</kbd>-clicking a Recent notebook opens it in a new
  tab (#1777)

* Improved matching of code formatting to match look when inactive and in edit
  mode on Windows and Linux - not perfect but closer (#1266)

* Autosave should not scroll assets/notebook/cells (#1622 / #1626 / #1686)

* Renaming the folder of the current notebook would not display the change in
  notebook name (#2046)

* Pre-formatted output text from R commands in output context was displaying
  without line breaks. Output is now consistent with output in notebook
  cells. (#1719)

* Leading and trailing spaces should not be allowed for protection groups and
  asset names, as it can lead to confusion or deception. Spaces at the ends of
  notebook names are mostly okay. (#1973)

* Allow opening a notebook in GitHub in view mode when running anonymously (#1823)

* Allow stopping a notebook in view mode when running anonymously (#1828)

* Allow removing your notebook through the UI if it was already deleted on
  GitHub (#2161)

* Switching asset tabs on a readonly notebook was allowing editing, resulting
  in errors (#1808)

* Renaming asset B.png to C.png, and A.png to B.png, resulted in both tabs
  displaying C.png, due to browser cacheing. (#2148)

* Deleting the last notebook in the recently opened list was failing. (#2132)

* The run button kept on blinking after the notebook was done! (#1812)

* The notebook tree would sometimes highlight the current notebook in a
  different tree from the one that was clicked. (#1905)


## RCloud 1.5.3

### Improvements

* `rcloud.message.dialog` for system messages or whenever you want an
  official-looking dialog to pop up and say something. (#91)

* The "RCloud Sample Notebooks" folder in the notebook tree now opens directly
  on the list of notebooks, rather than showing the list of "featured users"
  (an
  [all-user option](https://github.com/att/rcloud/wiki/RCS#user-state-and-options)). This
  happens if there is exactly one "featured user"; if there is more than one,
  then the list of users is shown as before (and as in the other roots of the
  notebook tree). (#1867)

* `rcloud.upload.path` gains `...` which can supply additional path components.

* New configuration option `use.gist.user.home` if set to `yes` allows deployments
  to use gist username as the executing user for purposes such as home directory
  location. It only applies if `exec.auth` is not set.

* Compatibility with newer 32-character GitHub gist IDs.


## RCloud 1.5.2

### Features

* Added support for sessions - the information about a session can be
  retrieved using `rcloud.session.info()`

* Output contexts can be created using `rcloud.output.context` for creating
  cell-like output in a mini-html notebook. This allows simple output of
  plots to a notebook with a custom layout, while supporting the resizing
  and plot export UI of a notebook cell. (#1669)

* Support for HTTP Basic Authentication for SOLR search. (#1794)


### Improvements

* `rcloud.session.log` function for sending messages straight to the session
  info pane or debugger console.


### Bugfixes

* updated `sourceURL` syntax for debugging javascript in the browser


## RCloud 1.5.1
### Bugfixes

* Converting a notebook to encrypted would fail if the notebook contained
  binary assets (#1616)

* Forking a foreign notebook (from a different gist source) with a binary
  asset would fail (#1606)

* Anonymous users had no RCloud home even if `exec.anon.user` is,
  specified which caused issues (among other things) with file upload
  (#1709)

* Redirects through the login page did not work in proxified setup,
  most notably re-authentication on links containing a notebook ID would
  lose the notebook reference by the time the user was authenticated (#1419).

* Markdown and RMarkdown containing deferred results were formatted as
  mangled mailto: links under compute separation (#1676 / #1725)

* If loading any assets for the RCloud page timed out, no message was
  displayed (#1710)


## RCloud 1.5

### Features
* RCloudDevice now supports `locator()` and thus the usual point+click
  R tools like `identify()`. An active locator is identified by a blue border
  of the plot and a crosshair cursor. To add points left-click on the plot,
  to end/abort a locator request use the `<ESC>` key. Note this is only
  avaliable in R cells (other cells like Markdown don't use RCloudDevice).

* Basic support for shell cells is now included. Note that each cell is
  a separate shell, so environment variables cannot be passed across
  shell cells. However, environment variables set in R will be inherited
  by the shell so R cells can be used to define them. Scripts are executed
  using bash.

* Recent notebooks menu provides access to recently opened notebooks.

* New function `rcloud.flush.plot()` allows explicit finalization of
  a plot -- this is in particular useful in loops where RCloud cannot
  detect automatically that a plot has been finalized and plot output
  is combined with other output. It is called automatically between
  cells.


### Improvements

* The root of RCloud homes is now configurable using `rcloud.user.home`
  configuration directive in `rcloud.conf`. The function `rcloud.home()`
  should be used to retrieve paths in user's RCloud home directory.

* The list of all-user extensions is now controlled by a simple rcloud.conf
  key, `rcloud.alluser.addons`, instead of by an RCS key populated from
  `rcs.system.config.addons`. This allows multiple RCloud instances to
  use the same RCS instance with different settings. (#1666)

* Proper "aw shucks" error message for bad notebook source. (#1699)



### Bug fixes
* In case a gist back-end token became invalid the login would fail with
  an error instead of re-authenticating. Note that this is a rare case where
  the cookie contains a valid RCloud token, but the back-end no longer
  honors the underying stored token.

* Large assets stopped working after a GitHub Enterprise update since
  it introduced re-directed raw links which was not supported. (#1658)

* Conversion of encrypted notebooks with binary assets to public was failing
  on public GitHub. (#1665)

* The asset panel wasn't getting immediately resized when the column was
  resized (#1623)

* Second ctrl-A wasn't going to the absolute beginning of the line (on Mac).
  (#1625)

* Empty and blank group names were accepted. (#1689)

* Promoting a protection group user from member to admin caused the user
  to lose all membership. (#1696)

* Find and replace was making read-only notebooks appear writeable, even in
  view mode. (#1672, #1681)

* RCloud was making erroneous requests for `/vector` and `/[object%20Object]`,
  causing 404 errors. (#1663)

* Foreign notebooks could not be Opened in GitHub from view mode (#1697)

* Large images were overlapping other panes in the Asset Viewer (#1660)

* Long names were escaping the notebook info popover. (#1593, #1637)

* Misplacement of settings panel scrollbar. (#1634)

* Spaces were retained at end of Disable and Enable Extensions options, causing
  silent failure. (#1693)

* Odd message on closing the Manage Groups dialog. (#1641)

* Bad line breaks in types in Workspace panel. (#1642)

* Clipboard copy was adding the text to the end of the page in view mode. (#1648)

* Locator and `rcloud.html.out` flush plots first thing when invoked. (#1691)

## RCloud 1.4.3
### Features
* Fork and remove folders. Fork and remove commands appear next to folders -
you can fork anyone's folder of notebooks, and you can remove an entire
folder of your own notebooks. When editing a folder name, you can press
ctrl/cmd-enter to fork that folder under the new name. (#1149 / #716)

### Improvements
* Navbar in view mode scrolls away, leaving more room for content (#700)
* RCloud detects when the compute process dies, and asks if you to reload the
notebook (#1601)
* Clicking on any code within the markdown output causes the code to be shown
(partial fix for #1607)
* Manage groups dialog shows the actions that will be performed.

### Bug fixes
* When assets are large, or the total size of a notebook is large, GitHub
could truncate them and require another request to get the content. This
could cause protected notebooks to become inaccessible, and also caused notebooks
to open with apparently blank assets/cells. githubgist now automatically loads
the content. (#1496, #1578, #1631)
* Compute session could get disconnected from its notebook content, causing
cell execution to have no effect, when forking or importing another notebook
(#1602, #1632)
* RCloud terminates the compute process when the control process dies, so that
resources are released. (#1605)
* Automatically-loaded stylesheets rcloud-*.css were not getting loaded due
to wrong MIME type (#1628)
* Long notebook names could cause navbar layout problems, obscuring part of
the notebook. (Now the title truncates in response to window resizes, and does
not get tall until the windows is less than about 850-950 pixels wide.) (#972)
* Settings panel was showing "Reload to see changes" when text fields were
clicked on but not changed (#1611)
* Help search box was not taking loaded packages into account with compute
separation. (#1604)
* Display the relevant error message (instead of a catch-all) when loading a
notebook fails in view mode. (#1638)
* On inaccessible notebook in URL, wait for dialog to close before loading
another notebook. (#1647)

## RCloud 1.4.2
### Improvement
* Since the protected notebooks feature does not seem to be entirely stable,
 especially in interaction with large notebooks and assets, we have introduced
 a flag in `rcloud.conf` disabling the feature. If `rcloud.conf` contains
 the key `disable.notebook.protection` (with any value), existing encrypted
 notebooks can still be opened, but the UI is disabled and the protection
 status of notebooks can't be changed. (#1580)

## RCloud 1.4.1
### Bug fix
* An API change in `RClient.create` was not backward compatible, breaking
 notebooks which embed the JavaScript that connects to the RCloud server
 (#1598)

## RCloud 1.4
### Features
* Protected notebooks. You can encrypt your notebooks and make them readable
 only by you or only by a select group of users. Protected notebooks will not
 be seen in the search results (although pre-encrypted versions of the content
 may be).

 View or modify the protection of a notebook through the notebook info command
 in the notebook tree. If you own the notebook, the protection will be a link
 which open the Notebook Protection dialog. From here you can assign the
 notebook to any group you are a member of, or make it private only to
 yourself. The second tab of the Notebook Protection dialog allows you to
 create groups, rename groups, and assign other users as administrators and
 members of the groups you administrate.
* View notebooks on other RCloud instances. The configuration file now allows
 configuring multiple git/github-based notebook stores with `gist.source`
 names. Specifying that name in the URL with `&source=name` loads the notebook
 from the other instance. Search has an option to search "All Lakes", i.e. all
 sources. For this release, all notebooks get displayed in the same tree;
 notebooks which are "foreign" get displayed in green and are read-only. You can
 fork and star notebooks from other instances; however, you can't comment on them.
* Stop execution of cells. Clicking the stop buttion in the navbar now sends an
 interrupt to the R process and terminates execution (when possible).
* Binary assets: you can now upload binary files to notebooks. The content is
 automatically detected and transparently encoded and decoded using base-64
 encoding. Where possible, the asset is displayed in its native format
 in the asset panel. Assets are currently limited to 750KB. (#683)
* Navbar menus [are
 customizable](https://github.com/att/rcloud/wiki/RCloud-UI-Extensions#navbar-menus),
 e.g. to display help or other resources in the area around the Advanced
 menu. (#1313)

### Improvements
* running a cell causes the whole notebook to save, e.g. you don't need to
  explicitly save an asset before running the cell that uses it (#1597)
* rcloud.shiny and rcloud.dcplot are independent packages which can be
  versioned/updated separately. any style sheet customization of rcloud.dcplot
  should be loaded manually using `rcloud.install.css` after rcloud.dcplot is
  loaded, instead of relying on the automatic "rcloud-*.css" hook. (#1371)
* toggle results for each cell, helpful when results are long and it's hard to
 find the next cell (#1487)
* hide all view.html ui elements, including cell status elements, on `&quiet=1`
 (#1449)
* Rename folders of notebooks. Clicking on a notebook folder the first time
 opens the folder. Clicking on the name a second time starts editing of that
 name (and any higher levels of the folder name). (#1393)
* New cell states to make enqueued execution clearer: if you change a cell
 when it is enqueued to be run, its state will turn to "unknown" (purple
 question mark) indicating that the result may not match the code in the
 cell. When it is running, it will display a spinning question mark. And when
 it has finished running, it will return to the "ready" state (empty circle)
 instead of the "complete" state, indicating it still needs to be run for the
 current code to be reflected in the output and state. (#1474 / #1456 / #1445 /
 #1436)
* New Notebook Prefix setting allows changing the prefix for new notebook
 names, e.g. to put new notebooks in a folder to keep the top level less
 cluttered. The default remains "Notebook ". (#885)
* multi-line command input is indicated with `+` as in command-line R. (#620)
* workspace panel is not updated if it is collapsed
* highlighting and syntax checking for html (#1387)
* ctrl-A and ctrl-E go to the beginning and end of actual line, not the wrapped
 line (on Mac) (#1417)

### Bug Fixes
* autosave was causing long cells to scroll (#1386)
* forking a notebook by renaming and pressing ctrl-enter, but not changing the
  name, should default to incrementing the number (#1548)
* fixed another edge case of message fragmentation where messages of exactly
  the wrong length would cause R-JavaScript connection to break
* improve markdown formatting #1502
* leaving a text field setting commits the change. (ESC still cancels, and Enter
  also commits.) #1523
* multiple password prompts executed seqentially could hang RCloud (#371)
* do not allow empty notebook path parts (#1491 / #1492)
* Python errors are now detected by the notebook, displaying the proper status
 and cancelling further cell execution. (#1433)
* empty Python cells could case RCloud to hang (#1403)
* restores error messages (like notebook not published) in view mode (#1424)
* tagged versions of notebooks were not available in view mode (#1369)
* fixes special html characters (such as `Press <enter> to continue`) in text
 input prompt. (#1383)
* fixes broken help with R 3.2.0 (#1482)
* fixes cases where forked notebooks within folders ended up with the same name
 as the original. (#1277)
* fixes cases where the text input prompt was truncated in view mode (#1453)
* redirects through the login page return to the same page that was
 requested. (If a custom login page is used, it should take `?redirect=` as a
 query parameter, and POST the same value to login.R when submitting the
 username and password.) (#1419 / #1282)
* various connectivity problems were fixed, caused by fragmentation of messages
 from the client to the server
* equations are properly displayed in RMarkdown cells (#1377)
* clicking to edit a cell which is scrolled hits the intended line (#1358)
* fix oversized left margin for markdown (#1401)

### Plugins
#### Workspace viewer
* the dimensions of data frames are now shown in the overview
* functions arguments are shown without the preceding function keyword to save
  space


## RCloud 1.3.4
* Catches errors in Workspace viewer when an object errors in str()

* Fixed an error when Cairo device is used outside of the RCloudDevice context.
  (#1427)
* Prefer the file extensions defined in RCloud language extensions over what
  GitHub infers, because sometimes it gets the language wrong. (#1412)

## RCloud 1.3.3
* Do not load rcloud language and ui extensions when doing a notebook.R call.

* Added `http.static.nocache` configuration entry governing the use of no-cache
  headers for statically served content. The default is now `no`, which means
  the browser is allowed to cache static content.  RCloud 1.3 through 1.3.2 used
  `yes` which can cause unnecessary load on the servers if there are no changes
  to the static content.

* Fixes a bug where line breaks were missing from content copied from inactive
  cells (#1389)

* Fixes a bug where only the first line is copied when copying cells in Firefox
  (#1413)

## RCloud 1.3.2
* Some reserved characters were not getting uri-encoded, resulting in passwords
  failing.

## RCloud 1.3.1

### Features
* Cell Run State Indicator.  Status messages such as "Cancelled!" and "Waiting"
  are no longer displayed in the result area.  Instead, an indicator resides in
  the bar above each cell:

  * Open circle means the cell has not been run.
  * Blue arrow means the cell is enqueued to run
  * Blue spinner means the cell is running
  * Green light means the cell ran and succeeded.
  * Red explamation point means the cell had an error
  * Orange splat means the cell run was cancelled

  This also helps with confusion with whether a cell has run when it doesn't
  produce output. (#1207, #1264)

* Non-preemptive stop. Although you still can't cancel a long-running cell,
  you can stop any later cells from running, by pressing the Stop button.

* Options to enable and disable extensions per user. The Settings pane
  has "Enable Extension" and "Disable Extensions", which set the user
  options `addons` and `skip-addons`, respectively. On starting the session,
  any extensions listed in `skip-addons` are not loaded. (#1346)

### Improvements
* "Subscribe to Comments" option is not shown if this feature is not
  configured on the server. (#1347)

* Editable cells are always (lightly) colored (#1322)

* Simplified, more correct workspace value printing

* When plots are too wide for the middle column, they scroll horizontally. (#1239)

* Settings that require a page reload tell you so when you make the change.

* Customizable logo for view.html

* Use line breaks when printing R stack traces (#1360)

* Controls in status area slightly greyer to distract from code less.

* Option to turn cell numbering off (#1213)

### Bug Fixes
* Patch to fix unauthenticated logins with view.html, shiny.html, notebook.R

* Patch for missing fork_of

* Hide subscribe to comments option if server not configured (#1347)

* Fix a case where backspace still would go back a page with some elements focused

* Fix a case where clicking on the last non-readonly notebook would edit the title (#1357)

* Fix bug where cell would overlap next cell or command prompt would appear on top
  of cell (#1352, #1354)

* Fix cases where extensions could cause non-GUI applictions to break

* Fix bug where asset would still be shown if current asset is deleted (#1343)

* Restore previous size and do not report (harmless) error when plot is resized too
  small (#1337)


## RCloud 1.3

### Features
* Simultaneously view code and output.  Instead of switching back and forth
  between code and output, most cells always show both the code and the output.
  Output is shown when the cell is run.  Click on the code to activate the cell's
  edit mode.

  Markdown cells behave slightly differently - since the markdown output already
  contains the code, the code editor is hidden when the markdown is run.  Click
  on any code within the markdown output, or click on the cell's edit mode button to
  activate it.

* Direct output and input.  Instead of printing a single result for each cell, the
  output is handled asynchronously, so it shows as it is available.  The code can
  also request lines of input, so e.g. `readline` now works - as do `browser` and
  `debug` for debugging!  Ordinary code cells do not use knitr/markdown for output, but send
  images, preformatted, and html output separately.

* Ability to save plots in other formats.  Hover the mouse over the plot for the
  disk icon to appear in the upper right corner, which contains a list of available
  image formats.  A widget at the lower-right corner can be used to resize the image.

* Search and replace across all cells in a notebook.  Ctrl/Cmd-F opens the
  find bar at the top of the notebook.  Type to search incrementally.

  Ctrl-H (Windows/Linux) / Cmd-Option-F (OSX) opens the replace bar.

  Search in results not currently supported.

* New simplified look.  Cells do not activate the editor until they are clicked on,
  so they use much less resources, and notebooks with a large number of cells
  load quickly.

* Automatic indentation for R code (#1110) and Python (#1105)

* Many ways to write extensions to add to the RCloud user interface.
  [Documentation](https://github.com/att/rcloud/wiki/RCloud-UI-Extensions).

* It is possible to add cell languages - Python, RMarkdown, and
  even R evaluation are performed by language add-ons.
  https://github.com/att/rcloud/wiki/RCloud-Language-extensions

* Experimental support for RMarkdown cells.  The old Markdown cells use the
  [markdown](http://cran.r-project.org/web/packages/markdown/index.html)
  and [knitr](http://yihui.name/knitr/) packages directly for output;
  RMarkdown cell use [rmarkdown](http://rmarkdown.rstudio.com/) (a.k.a. R Markdown v2).

* Option to receive email updates when your notebook is commented on (#900)

* Notebook Information pop-up shows the people who have starred a notebook (#935)

* Select the entire notebook with ctrl/cmd-A (#1321)



### Improvements

* Animated icon when first loading the page (#1028)

* Better help given when searches fail due to syntax errors (#1061)

* Year shown in version and notebook dates when the year is not this one (#986)

* Ability to right click on search results to open in new tab (instead of control-clicking) (#1054)

* Shareable link uses tagged version instead of version, if it exists (#1044)

* Formal arguments shown for functions in Workspace (#994)

* Option to turn off terse dates (#1040)

* Cell number is shown above each cell in its status area (#1126)

* `shared.R` can be used to serve static content out of of the `www/` folder of
  any installed R package. (#1147)

* redis database number and password can be set

* Can grab the status area above cell as well as the gutter area in order to reorder cells.
  Allows moving cells when not editing them

* Clicking to edit cell sets the cursor position based on the click location

* Supports PAM and JAAS supported Authentication modules like Kerberos, LDAP, etc.
  Refer: https://github.com/s-u/SessionKeyServer/blob/master/README.md

* Custom R code akin to the ubiquitous `Rprofile` can now be run at the end of session
  initialization as the script `conf/Rcloud.profile`

* Selection of the cells and results will not select the ui elements, so it's possible to
  copy and paste whole sections of the notebook and results. (#1221)



### Bug fixes

* Changing the working directory is now persistent across R cells (#833)

* Dataframe was not cleared when loading a new notebook (#1045)

* Comments were not getting deleted from search (#826)

* Loading notebook by ID failed when there was whitespace (#1115)

* Notebook wasn't saved before forking (#1083)

* Importing a notebook would cause the browser title to change (#1168)

* Messages from the server could get fragmented and produce "Invalid typed array
  length" error or silent failures (#1135)

* Issues with knitr creating duplicate plots fixed (#1046)

* (Mis)feature where a prior notebook is loaded if the current notebook can't be,
  restricted to problems with loading the notebook.


## RCloud 1.2-patched

### Bug Fixes

* Encoding of some characters was failing in the login script, leading to
  authentication failures with valid passwords

### Improvements

* Retrieval of multi-user information from RCS was vectorized, dramatically
  reducing the number of round-trips to RCS store and associated latency.

## RCloud 1.2.1

### Bug Fixes

* Smaller file upload packet size to avoid Rserve disconnection bug

* Do not check python idle state

* Workaround for varying `fork_of` github interface

* Error when deleting currently-loaded notebook (#1049)


## RCloud 1.2

### Features

* The script `scripts/mkdist.sh`, which produces a tarball of RCloud and
  all its dependencies (e.g. for off-line installation) has been consolidated
  into `scripts/bootstrapR.sh --mk-dist`

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

* The notebook store is now abstrated through the `gist` package,
  allowing arbitrary back-ends. The traditional GitHub Gist backend is
  now handled by the `githubgist` package. Alternative back-end based
  on local git repositories is implemented in `gitgist`. The back-end
  is selected by the `gist.backend` configuration option. It currently
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

* Search UI improvements.  Search results are paginated for improved navigability
  and performance.  Search results show all results within each notebook.  (If
  there are many results, they are hidden/shown inline with a "show more" link.)
  Search results can be sorted by user, notebook name, date, or stars, in ascending
  or descending order.  Improvements to display of result line numbers and
  comment results.

* Tagged versions: instead of using hexadecimal hashes for notebook versions,
  you can tag them by clicking a second time on the version in the history in
  the notebook tree, and entering a human-readable name. You can also load a
  notebook version by specifying `&tag=name` instead of `&version=hash` in the
  URL (works with {edit,view,mini,shiny}.html; notebook.R not supported
  yet). Each version can only have one tag, and each tag can only have one
  version: if a tag is reused, it is removed from the previous version. Enter a
  blank tag (delete the tag and press enter) to remove it.

* Actions are logged on the server side using Rserve's `ulog`.

* Preliminary [RStudio Shiny](http://shiny.rstudio.com/) support via rcloud.shiny
  package.  rcloud.shiny emulates a network connection to run Shiny on an RCloud
  server and client instead of Shiny Server.  Basic functionality is supported,
  but Shiny extensions are not supported yet.

* It is possible to create custom side panels for RCloud edit mode.

* Add-on packages can be loaded per-user (RCS key `<user>/system/config/addons`)
  or for all users (`.allusers/system/config/addons`).  These packages are
  loaded at the beginning of each session, and have access to the RCloud UI (via
  ocaps) to add side panels or other UI elements.  See the example
  rcloud.packages/rcloud.viewer

* Workspace Viewer - shows variables in the environment and their current values.

* Dataframe Viewer - `View(dataframe)` will show the contents of the dataframe
  in the Viewer side panel.

* Forked-from notebook shown below notebook title, with link to the original
  notebook.  Since github gists do not allow forking one's own notebooks, emulate
  the `fork_of` value for self-forked notebooks.

* shared.R allows packages to serve files via URLs.

* Select the type of view (shareable link) for each notebook by using the
  drop-down menu to the right of the Shareable Link button.

* RCloud Sample Notebooks folder in the tree, to feature certain users and their
  example notebooks.

* Initialize RCS keys under .allusers/system by adding rcloud.conf entries
  `rcs.system.*`


### Improvements

* Disabled backspace as a shortcut to the back button to prevent some accidental
  navigation away from RCloud

* MathJax is installed directly into the htdocs/ directly, to speed startup
  and make RCloud easier to install in private intranets.

* Delete and edit comments.  Multiline comments are allowed, and newlines
  are displayed properly in comments.

* Date and time of notebook versions are shown in a minimal but more
  informative format, displaying only the parts that are different
  from the previous version.

* CSS highlighting and syntax

* Improved, more consistent control styles.

* Ctrl-S and Cmd-S now save the notebook rather than invoking the browser's
  save command

* It is possible to disable the command prompt, which is confusing to some
  users.  The option is in the new Settings panel.

* Insert cell button inserts a cell of the same language as the cell
  below it.

* Default language for final insert button is saved per-user.

* Shortcuts for forking notebooks.  When changing the title or tagging a version
  of a notebook, press ctrl/cmd-enter to fork.

### Bug fixes

* Assets without filename extensions are allowed.

* Error message for attempting to rename an asset over another one.

* Downloading of files (Export Notebook / Export as R Source) now works
  in Firefox.

* Fixed a bug where arrow keys were captured by the notebook so the selection
  could be moved off the current notebook.

* Fixed a glitch where notebook comman\ds could take more than one row to display;
  hide date entirely when showing notebook commands, and don't show the commands
  when hovering over notebook versions.

* Fix to error propagation for notebook.R when an asset does not exist or the
  notebook is not published.

* Fixed URL for Sharable Link of notebook version.

* Fixed Unicode support (for assets and everywhere) - repair mismatch between
  JavaScript UTF-16 and R UTF-8 strings.

* Save asset before renaming it - changes were getting lost.

* When a notebook fails to load, the previously loaded notebook gets loaded.
  This could cause a near-infinite loop when there is a problem that causes
  no notebooks to load, so this behavior is now limited to trying 5 notebooks.


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
