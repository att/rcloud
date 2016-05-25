---
title: RCloud&#58; 1.3 What's New!
layout: default
---

<div class="frmttng">

<h1> {{page.title}} </h1>

</div>

2015-02-14

## Table of Contents

1. [Functional Enhancements](#functional)
    * [Efficient Loading](#efficientloading)
    * [RMarkdown Cells](#rmarkdowncells)
    * [Failed Searches](#failedsearches)
    * [Shareable Links](#shareablelinks)
    * [Better Workspace Value Display](#betterworkspacevaluedisplay)
    * [Page Reloads](#pagereloads)
    * [visit.html Logo](#visitlogo)
    * [Line Breaks](#linebreaks)
1. [GUI Enhancements](#gui)
    * [Cleaner Interface](#cleanerinterface)
    * [Cell Run-State Indicator](#cellrunstateindicator)
    * [Non-Preemptive Stop](#nonpreemptivestop)
    * [Editable Cell Color](#editablecellcolor)
    * [Auto Indentation](#autoindentation)
    * [Code and Output](#codeandoutput)
    * [Direct Input and Output](#directinputandoutput)
    * [Saving Plots](#savingplots)
    * [Big Plots](#bigplots)
    * [Search and Replace](#searchandreplace)
    * [Notebook Information Icon](#notebookinformationicon)
    * [Startup Animation](#startupanimation)
    * [Years](#years)
    * [Right-Clicking Search Results](#rightclickingsearchresults)
    * [Arguments for User-Defined Functions](#argumentsforuserdefinedfunctions)
    * [Terse Dates](#tersedates)
    * [Extensions](#extensions)
    * [Comments Subscriptions](#commentssubscription)
    * [Cell Numbers](#cellnumbers)
    * [Reordering Cells](#reorderingcells)
    * [Clicking in Edit Cells](#clickingineditcells)
1. [Technical Enhancements and Notes](#tech)
    * [Extenstions to RCloud User Interface](#extensionstorclouduserinterface)
    * [RCloud Language Add-Ons](#rcloudlanguageaddons)
    * [shared.R](#sharedr)
    * [Redis Database Number and Password](#redisdatabasenumberandpassword)
1. [Bug Fixes/Improvements](#bugfixes)

<a name="functional" ></a>

## 1. Functional Enhancements

<a name="efficientloading" ></a>

### Efficient Loading

After loading a notebook, cells do not activate the editor until they are clicked on. This makes loading notebooks with a large number of cells more efficient and therefore faster.

[Top](#top)

<a name="rmarkdowncells" ></a>

### RMarkdown Cells; Experimental Support

Experimental support for RMarkdown cells is included.  Old Markdown cells use the [markdown](http://cran.r-project.org/web/packages/markdown/index.html) and [knitr](http://yihui.name/knitr/) packages directly for output; RMarkdown cells use [rmarkdown](http://rmarkdown.rstudio.com/) (a.k.a. R Markdown v2).

[Top](#top)

<a name="failedsearches" ></a>

### Failed Searches

If you enter a search term that contains a SOLR/Lucene syntax error, for example, "bad:", RCloud will output a message about syntax and include a link to Lucene query parser syntax.

[Top](#top)

<a name="shareablelinks" ></a>

### Shareable Links

If you tag a version of your notebook, load it, and then select one of the shareable links, RCloud will populate the URL with the tag instead of the version. This is beneficial because then you can tag a different version of the same notebook and pre-existing URLs won't point to the wrong version of the notebook.

[Top](#top)

<a name="betterworkspacevaluedisplay" ></a>

### Better Workspace Value Display

Workspace values are displayed simply and more accurately.

[Top](#top)

<a name="pagereloads" ></a>

### Page Reloads

If a change in settings requires a reload, RCloud will indicate that a reload is necessary.

[Top](#top)

<a name="visitlogo" ></a>

### visit.html Logo

The logo used in visit.html is customizable.

[Top](#top)

<a name="linebreaks" ></a>

### Line Breaks

When displaying R stack traces, RCloud uses line breaks.

[Top](#top)

<a name="gui" ></a>

## 2. GUI Enhancement

<a name="cleanerinterface" ></a>

### Cleaner Interface

The RCloud team has put a lot of work into creating a new cleaner interface, reducing visual clutter. Please, let us know what you think!

[Top](#top)

<a name="cellrunstateindicator" ></a>

### Cell Run-State Indicator

The run-state of each cell is displayed via an icon in between the gutter and cell name:

![opencircle](img/opencircle.png): Cell has not been run

![bluearrow](img/bluearrow.png): Cell is scheduled to be run

![runningcircle](img/runningcircle.png): Cell is running

![greencircle](img/greencircle.png): Cell has run successfully

![exclaim](img/exclaim.png): Cell ran but had errors

![splatcircle](img/splatcircle.png): Cell's run was cancelled

[Top](#top)

<a name="nonpreemptivestop" ></a>

### Non-Preemptive Stop

When you run a notebook, you can prevent scheduled cells from running by pressing the stop button, located in the header at the top of the screen:

![nonpreemptivestop](img/stop.png)

Note that this will not interrupt currently running cells (![runningcircle](img/runningcircle.png)). It will only prevent scheduled cells from running.

[Top](#top)

<a name="editablecellcolor" ></a>

### Editable Cell Color

Editable cells are lightly colored.

[Top](#top)

<a name="autoindentation" ></a>

### Auto Indentation

R and Python cells have automatic indentation.

[Top](#top)

<a name="codeandoutput" ></a>

### Code and Output

Most cells show both the code and the output. Output is shown when the cell is run.  Click on the code or the edit code icon in cell's status bar to activate the cell's edit mode.

![codeandoutput](img/codeandoutput.png)

Markdown cells behave slightly differently - since the markdown output already contains the code, the code editor is hidden when the markdown is run.  Click on any code (not markdown) within the markdown output, or click on the edit code icon in the status bar to activate it.

[Top](#top)

<a name="directinputandoutput" ></a>

### Direct Input and Output

When you execute a notebook, cells are executed asynchronously, so output for individual cells will appear as it becomes available.

Code can also request lines of input. E.g. `readline` works - as does `browser` and `debug` for debugging purposes.  Ordinary code cells do not use knitr/markdown for output but send images, pre-formatted, and html output separately.

E.g.

![readline](img/readline.png)

And the result:

![readline_results](img/readline_results.png)

For debugging:

![browse](img/browse.png)
[Top](#top)

<a name="savingplots" ></a>

### Saving Plots

Hover the mouse over a plot created in an R cell to make the disk icon appear in the upper right corner (see 1), which contains a list of available image formats.  A widget at the lower-right corner can be used to resize the image (see 2).

![saveresize](img/saveresize.png)

[Top](#top)

<a name="bigplots" ></a>

### Big Plots

RCloud displays a horizontal scrollbar when plots that are too wide to display completely in the middle column.

[Top](#top)

<a name="searchandreplace" ></a>

### Search and Replace

Users can search/search-place across all cells in a notebook.

Ctrl/Cmd-F opens the find bar at the top of the notebook.  Type to search incrementally.

![find](img/find.png)

Ctrl-H (Win, Linux), Cmd-Option-H (Mac) opens the replace bar.

![find_replace](img/find_replace.png)

[Top](#top)

<a name="notebookinformationicon" ></a>

### Notebook Information Icon

Clicking the notebook information icon shows which users have starred a notebook.

![notebookinfo](img/notebookinfo.png)

[Top](#top)

<a name="startupanimation" ></a>

### Startup Animation

RCloud displays an animated icon when first loading a notebook.

![notebook_loading](img/notebook_loading.png)

[Top](#top)

<a name="years" ></a>

### Years

When versions are more than a year old, the year is displayed in the notebook version dates.

[Top](#top)

<a name="rightclickingsearchresults" ></a>

### Right-Clicking Search Results

Users can right click on search results to open results a new tab.

[Top](#top)

<a name="argumentsforuserdefinedfunctions" ></a>

### Arguments for User-Defined Functions

Function arguments are shown in the Workspace panel.

Given the following user defined function:

![function](img/function.png)

The arguments are displayed in the Workspace panel:

![functionargsinworkspace](img/functionargsinworkspace.png)

[Top](#top)

<a name="tersedates" ></a>

### Terse Dates

There is an option to turn off "terse dates" in the Options panel.

![settings](img/settings.png)

[Top](#top)

<a name="extensions" ></a>

### Extensions

You can enable and disable per-user extensions using the "Enable Extensions" and "Disable Extensions" text boxes. These set the user options `addons` and `skip-addons`, respectively. On starting the session, any extensions listed in `skip-addons` are not loaded.

![settings](img/settings.png)

[Top](#top)

<a name="commentssubscription" ></a>

### Comments Subscription

If your server is set up to allow subscribing to comments, the Subscribe to Comments option will appear in the settings panel:

![commentsubscribe](img/commentsubscribe.png)

[Top](#top)
<a name="cellnumbers" ></a>

### Cell Numbers

Cell number is shown above each cell in its status area.

![cellnumbers](img/cellnumbers.png)

You can turn off this feature in the settings panel:

![settings](img/settings.png)

[Top](#top)

<a name="reorderingcells" ></a>

### Reordering Cells

Users can grab the status area above cell as well as the gutter area (![dragcell](img/dragcell.png)) in order to reorder cells. This allows users to move cells when not editing them.

[Top](#top)

<a name="clickingineditcells" ></a>

### Clicking in Edit Cells

Clicking into an edit cell sets the cursor position to the clicked location.

[Top](#top)

<a name="tech" ></a>

## 3. Technical Enhancements and Notes

<a name="extensionstorclouduserinterface" ></a>

### Extensions to RCloud User Interface

There are many ways to write extensions to the RCloud user interface. For more information, see [the wiki](https://github.com/att/rcloud/wiki/RCloud-UI-Extensions).

[Top](#top)

<a name="rcloudlanguageaddons" ></a>

### RCloud Language Add-Ons

Administrators can add cell languages. R, RMarkdown, and Python evaluation is performed by language add-ons. For more information see [the wiki](https://github.com/att/rcloud/wiki/RCloud-Language-extensions).

[Top](#top)

<a name="sharedr" ></a>

### shared.R

'shared.R' can be used to serve static content out of of the 'www/' folder of any installed R package. This enables many Shiny packages, which can include javascript, css, and images.

[Top](#top)

<a name="redisdatabasenumberandpassword" ></a>

### Redis Database Number and Password

redis database number and password can be set.

[Top](#top)

<a name="bugfixes" ></a>

## 4. Bug Fixes

* Unauthenticated login functionality with view.html, shiny.html, notebook.R is working correctly.
* `fork_of` is not missing.
* The backspace key doesn't cause your browser to go to the previous page.
* Clicking on the last writable notebook does not edit the title.
* Cell or command-prompt never overlap.
* Extensions cannot cause non-GUI applications to break.
* Deleted assets are not displayed.
* If a plot is resized too small, RCloud restores previous size and does not report this (harmless) error.
* The Dataframe panel clears when loading a new notebook.
* Deleted comments are not included in search.
* Loading a notebook by ID does not fail if a whitespace appears at the end.
* Notebooks are saved before forking.
* Importing notebooks does not cause the browser title to change.
* Messages from the server are not fragmented and do not produce "Invalid typed array length" error or silent failures.
* knitr does not produce duplicate plots.
* Prior notebooks are not loaded if the current one cannot be loaded.

[Top](#top)
