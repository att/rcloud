# r-repo-parse

A parser of R package and repository metadata, namely the DESCRIPTION
and PACKAGES files which declare individual packages and their
dependencies.

Provides a limited R language parser to read `Authors@R` fields
without the use of `eval`. Provides a `parse-authors` command-line
interface which outputs a SQLite3 database of authors information.
This is tested against all the packages in CRAN.

## Status

Zig module: fully operational against CRAN repository.

`parse-authors` command-line program: fully operational against all
CRAN package DESCRIPTION files.

C static library: proof of concept of Zig/C interop, but not
operationally deployed.

# License

Currently licensed under GPL v3 or later primarily to prevent
its unrestricted commercial use. I am considering a more permissive
license.
