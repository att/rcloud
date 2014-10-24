########################
print("Installing Cairo Dependencies")
system2("tar", args = c("xf", "cf-ubuntu-lucid-deps.tar.gz", "-C", "/app"))

dependencies = c(
    "xsltproc", "x11proto-core-dev", "libpthread-stubs0-dev", "libxau-dev", "xcb-proto", "libxcb1-dev", "libxcb-render0-dev",
    "libxcb-render-util0-dev", "libpng12-dev", "libfreetype6-dev", "libfontconfig1-dev", "libpixman-1-dev", "libcairo2-dev"
)

for (dependency in dependencies) {
    Sys.setenv( "PKG_CONFIG_PATH" = paste( Sys.getenv("PKG_CONFIG_PATH"), ":/app/vendor/", dependency[1], "/lib/pkgconfig", sep = "" ) )
}

#######################
print("Installing MathJax Dependencies")
dir.create("htdocs/mathjax", recursive = TRUE)
system2("curl", args = c("-L", "https://codeload.github.com/mathjax/MathJax/legacy.tar.gz/master", "|", "tar", "-xz", "-C", "htdocs/mathjax", "--strip-components=1"))

########################
print("Installing RCloud")
options(repos=c(CRAN = "http://cran.rstudio.com/", "http://RForge.net", "http://R.research.att.com"))
#system2("./scripts/build.sh") # FIXME: This does not seem to work?
install.packages("devtools", quiet = TRUE)

packages = c(
    "packages/gist", "packages/githubgist", "rcloud.support", "rcloud.client", "rcloud.packages/rcloud.dcplot",
    "rcloud.packages/rcloud.lux", "rcloud.packages/rcloud.shiny", "rcloud.packages/rcloud.viewer", "rcloud.packages/rcloud.web"
)

for (package in packages) {
    devtools::install(package, dependencies = TRUE, quiet = TRUE)
}

rcloud.support:::check.installation() # prevent the same command in conf/run_rcloud.R from slowing down the startup by pre-processing it
