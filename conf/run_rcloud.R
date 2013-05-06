args <- commandArgs(trailingOnly=TRUE)
library(Rserve)
print(args)

debug=FALSE
Rserve(debug, args=c("--RS-conf", args[1], "--RS-source", args[2], "--vanilla", "--no-save"))
