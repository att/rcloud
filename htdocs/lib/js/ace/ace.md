RCloud-flavored Ace

RCloud's version of ace.js is the standard ace-builds distribution (`src` version), with the
following changes:

- we concatenate using grunt (see RCloud root Gruntfile.js)
- `ace/_begin.js` and `ace/_end.js` backup and restore some global variables; this may have a
  similar effect to the `src-noconflict` version
- we use the following files from `rstudio/ace-cpp-autoindent` (all `require` paths must be prefixed
  with `ace/`):
  - `r.js` -> `mode-r.js`
  - `auto_brace_insert.js`
  - `r_code_model.js`
  - `r_highlight_rules.js`
  - `r_matching_brace_outdent.js`
  - `r_scope_tree.js`
  - `tex_highlight_rules.js`

