---
title: RCloud 1.8&#58; What's New!
layout: default
---

<a name="top"></a>

<div class="frmttng">

<h1> {{page.title}} </h1>

</div>

# Release Notes; Latest Version: v1.8

Created 2017-06-01. **What's New!** contains a list of new features, GUI enhancements and bug fixes. It is currently maintained by [Spencer Seidel](http://www.spencerseidel.com) on a voluntary basis. 

<a name="gui"></a>

## 1. GUI Enhancements

<a name="hidingoutputcells"></a>

### Hiding output cells

![HIDECELLS](img/hidecells.png)

Use the checkboxes to select a group of output cells or all output cells. Then, click the show-result icon to toggle their visibility.

*Note*: This feature is only available for your own notebooks.

[Top](#top)

### Selecting view types from the shareable menu

When you select a view type from the shareable link menu (click the ![SHARE](img/header_share.png) icon), the link is opened in a new browser tab.

[Top](#top)

### Single cell selection as toggle

When only one cell is selected, clicking it deselects it. Clicking an unselected cell selects it.

[Top](#top)

### Running only selected cells

`Ctrl/Cmd`-click the play icon in the header ![PLAY](img/header_play.png) to run only the selected cells.

[Top](#top)

### `rcloud.html.out` `rcloud.out` `rcloud.home`

`rcloud.html.out`, `rcloud.out`, and `rcloud.home` are documented in the built-in RCloud documentation system, accessible from the Help tab search feature:

![HELP](img/help.png)

[Top](#top)

<a name="functional"></a>

## 2. Functional Enhancements

### Asset sizes

Assets are limited to 2.5 MB in order to minimize performance problems. Assets are only appropriate for small amounts of data, scripts, graphics, etc. Larger data files should be read from disk.

[Top](#top)

## 3. Technical Enhancements and Notes

### RCloud Gist Services

RCloud Gist Services replaces the GitHub Gist API:

1. Notebooks can be forked more than once.
2. History is preserved when forking your own notebook.
3. Deleting or adding cells quickly does not result in a race condition.
4. Forked notebook names do not conflict.

[Top](#top)

### `solr.post.method`

The `solr.post.method` optional configuration variable allows RCloud administrators to change the way SOLR POST update requests are issued. Available values are:

|Value|Description|
|---------|-------------------------------------------------|
|`async`|Asynchronous, internal httr (Rcloud 1.8 default)|
|`sync`|Synchronous, internal (Rcloud 1.7 default)|
|`curl`|Asynchronous, external `curl` command|

*Note*: In the case of `curl`, use the `solr.curl.cmd` variable to change the default invocation of `curl`.

[Top](#top)

## 4. Bug Fixes

|Issue #s|Description|
|--------|----------------------------------------------------------------------------|
|1712|You can fork notebooks more than once.|
|702|History is preserved when you fork your own notebook|
|32|Adding or deleting cells quickly does not result in race condition.|
|236, 703|Names of forked notebooks do not conflict. When forking, notebooks are given a unique number if the user already has a notebook with that name.|
|2139|When trying to load a notebook when a session has been dropped, the selected notebook is still loaded.|
|2369|Recent notebooks are shown even when initial notebook fails to load.|
|2371|Notebooks are saved when clicking a Sharable Link.|
|1716|The name of the notebook in the "forked from" link is updated when the notebook name changes.|
|2414|Clicking in the wrong part of the Recent Notebooks menu does not cause the notebooks panel to minimize.|
|2209|If any imported external notebooks are found to be invalid during an import (Import External Notebooks), only those specific notebooks will fail.|
|2401|Users can copy text from assets of read-only notebooks.|
|2390|Upload button is disabled when no files are selected|

[Top](#top)

