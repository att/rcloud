RCloud-flavored Ace

RCloud's version of ace.js is the standard ace-builds distribution (`src` version), with the
following changes:

- we concatenate using grunt (see RCloud root Gruntfile.js)
- `ace/_begin.js` and `ace/_end.js` backup and restore some global variables; this may have a
  similar effect to the `src-noconflict` version
- we use the following files from `rstudio/ace-cpp-autoindent` - these appear to be the same sources
  that RStudio uses, but more accessible, since RStudio appears to be a huge, monolithic repo
  - `r.js` -> `mode-r.js`
  - `auto_brace_insert.js`
  - `r_code_model.js`
  - `r_highlight_rules.js`
  - `r_matching_brace_outdent.js`
  - `r_scope_tree.js`
  - `tex_highlight_rules.js`
- all `require` paths in those files must be prefixed with `ace/`
- the Ace API has changed a bit since those modes were published, and last I checked RStudio was
  using the old Ace. So there are a few minor patches needed to make these files work. Currently
  those changes are in commit ffab1b007b0445739eb269c64cf7afac71992fd7
- we add `\.` to the identifier regex so that autocomplete replaces whole R identifiers.
- `getCompletions` is defined synchronously in Ace, but we need it to be synchronous in order to
  call an R function
- there's a hack in `ext-language_tools.js` where we need to create an array from
  `selection.getRange()` instead of `selection.getAllRanges()` - unclear why the latter doesn't work
- ace-cpp-autoindent needs extra parameters for `mode.getNextLineIndent()` to work
- add call to rcloud.get_completions for python mode
- resize completion popup to fit contents in `ext-language_tools.js`
