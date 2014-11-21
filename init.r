########################
print("Installing Cairo Dependencies")
system2("tar", args = c("xf", "cf-ubuntu-lucid-deps.tar.gz", "-C", "/app"))

dependencies = c(
    "xsltproc", "x11proto-core-dev", "libpthread-stubs0-dev", "libxau-dev", "xcb-proto", "libxcb1-dev", "libxcb-render0-dev",
    "libxcb-render-util0-dev", "libpng12-dev", "libfreetype6-dev", "libfontconfig1-dev", "libpixman-1-dev", "libcairo2-dev"
)

for (dependency in dependencies) {
    Sys.setenv( "PKG_CONFIG_PATH" = paste0( Sys.getenv("PKG_CONFIG_PATH"), ":/app/vendor/", dependency[1], "/lib/pkgconfig") )
}

Sys.setenv( "PKG_CXXFLAGS" = paste( Sys.getenv("PKG_CXXFLAGS"), "-I /app/vendor/boost_1_57_0"))

########################
print("Installing RCloud")
system2("./scripts/bootstrapR.sh")
rcloud.support:::check.installation()
