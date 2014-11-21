#!/bin/sh

if [ x"$1" = 'x-h' ]; then
    cat <<EOF

 Usage: $0 [--mk-dist]

 This script must be run from the RCloud root directory and it
 installs R packages needed by RCloud in the R installation

 Optional environment variables:
 RBIN        - location of the R executable [R]
 RCREPO      - repository of RCloud packages [<RCloud>/packages]
 DISTREP     - distribution repository [<RCloud>/dist-repos]

 If DISTREP exists, it will be used to bootstrap R without using
 remote repositories. If it doesn't exist, packages from RCREPO
 are used along with dependencies from remote repositories.
 If RCREPO doesn't exist, it is created from the source tree.

 DISTREP can be created using --mk-dist in which case it
 is built from sources and remote repositories

EOF
    exit 0
fi

WD=`pwd`

if [ ! -e "$WD/rcloud.support/DESCRIPTION" ]; then
    echo ' ERROR: you must run this script from the RCloud root directory!' 1>&2
    exit 1
fi

: ${RCREPO="$WD/packages"}
: ${DISTREP="$WD/dist-repos"}
: ${RBIN=R}

ok=`echo 'if(R.version$major>=3)cat("OK\n")' | "$RBIN" --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    echo -e '\n ERROR: R is not available in the correct version.\n' 1>&2
    exit 1
fi

export RCS_SILENCE_LOADCHECK=TRUE

mkdist=''
if [ x"$1" = "x--mk-dist" ]; then
    mkdist=yes
fi

if [ -n "$mkdist" -o x"$1" = "x--clean" ]; then
    echo " --- Cleaning existing repositories"
    rm -rf "$DISTREP/src/contrib" "$RCREPO/src/contrib"
fi

if [ ! -e "$DISTREP/src/contrib/PACKAGES" -o -n "$mkdist" ]; then
    ## we need RCREPO populated in any case
    if [ ! -e "$RCREPO/src/contrib/PACKAGES" -o -n "$mkdist" ]; then
        echo " --- Creating RCloud repository $RCREPO"

        if ! mkdir -p "$RCREPO/src/contrib"; then
            echo -e "\nERROR: cannot create src/contrib in $RCREPO, please set RCREPO if other location is desired" 1>&2
            exit 1
        fi

        echo " Builds RCloud packages"
        (
          cd "$RCREPO/src/contrib"

          for src in `ls $WD/rcloud.*/DESCRIPTION $WD/rcloud.packages/*/DESCRIPTION $WD/packages/*/DESCRIPTION 2>/dev/null`
          do
            "$RBIN" CMD build `dirname "$src"`
          done
        )
        "$RBIN" --vanilla --slave --no-save -e "tools:::write_PACKAGES('$RCREPO/src/contrib')" || exit 1
    fi

    if [ -z "$mkdist" ]; then
        ## regular boostrap from clean sources - install deps
        echo " --- Installing RCloud packages and dependencies in R"
        "$RBIN" --vanilla --slave --no-save <<RCMD || exit 1
  install.packages(
    # Find all tar'ed packages and extract the package name from them
    unique(
      gsub(
        '_.*', '', basename(Sys.glob('$RCREPO/src/contrib/*.tar.gz'))
      )
    ),
    repos = c('file://$RCREPO', 'http://r.research.att.com', 'http://rforge.net'),
    type = 'source'
  )
RCMD

    else
        ## mkdist
        if ! mkdir -p "$DISTREP/src/contrib"; then
            echo " ERROR: cannot create src/contrib in $DISTREP. please set DISTREP if other location is desired" 1>&2
            exit 1
        fi
        cp -p "$RCREPO/src/contrib/"*.tar.gz "$DISTREP/src/contrib/"

        "$RBIN" --vanilla --slave <<RCMD || exit 1
  options(warn = 2)

  # Find all tar'ed packages and extract the package name from them
  pkg <- unique(
    gsub(
      '_.*', '', basename(Sys.glob('$RCREPO/src/contrib/*.tar.gz'))
    )
  )
  cran = available.packages(contrib.url(c('http://r.research.att.com/', 'http://rforge.net'), type = 'source'), type = 'source')
  local = available.packages(contrib.url('file://$RCREPO', type = 'source'), type = 'source')
  repos = c('http://rforge.net', 'http://r.research.att.com', 'file://$RCREPO')
  
  rcloud_deps = unique(unlist(tools:::package_dependencies(pkg, local, 'all')))
  deps_of_rcloud_deps = unique(unlist(tools:::package_dependencies(rcloud_deps, rbind(cran, local), recursive = TRUE)))
  deps = unique(c(rcloud_deps, deps_of_rcloud_deps))
  
  locally_installed_packages = rownames(installed.packages(, 'high'))
  packages_needing_installation = deps[!(deps %in% locally_installed_packages)]
  print(packages_needing_installation)

  download.packages(packages_needing_installation, '$DISTREP/src/contrib', repos = repos, type = 'source')
  tools:::write_PACKAGES('$DISTREP/src/contrib')
RCMD

        echo -e "\n Distributon packages created in $DISTREP"
        exit 0
    fi
else
    ## Installation from a distribution
    "$RBIN" --slave --vanilla <<RCMD
  cat(sprintf("\n Using %s, installing packages...\n", R.version.string))
  url = "file://'"$DISTREP/"'"
  packages = rownames(available.packages(paste0(url, "/src/contrib")))
  install.packages(packages, repos = url, type = "source")
RCMD
fi

ok=`echo 'library(rcloud.support);library(rcloud.client);library(Cairo);library(rjson);cat("OK\n")' | "$RBIN" --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    cat <<EOF >&2

 ERROR: one or more packages could not be installed.
 Please check that you have all necessary dependencies installed

EOF
    exit 1
fi

cat <<EOF

 ============================================================================

  IMPORTANT: please edit conf/rcloud.conf to setup your GitHub application
  (see instructions on https://github.com/att/rcloud for the procedure)

  After doing so, you can then use conf/start to start up the RCloud server

  NOTE: If you use force or upgrade in check.installation() it will upgrade
        to the latest development version of RCloud which may or may not be
        what you want. Re-run this script if you get into trouble and want
        back to the released version.

EOF
