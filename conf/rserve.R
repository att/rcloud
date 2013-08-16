require(rcloud.support)

## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

configure.rcloud()

## re-export RC.authenticate for authentication
RC.authenticate <- rcloud.support:::RC.authenticate
