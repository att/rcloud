cookies <- function(headers) {
  a <- strsplit(rawToChar(headers), "\n")
  if (length(a) && length(c <- grep("^cookie:", a[[1]], TRUE)) &&
      length(p <- unlist(strsplit(gsub("^cookie:\\s*", "", a[[1]][c], TRUE), ";\\s*")))) {
    ## annoyingly, we can't use strsplit, because it has no limit argument and we need only one =
    keys <- gsub("\\s*=.*", "", p)
    vals <- as.list(gsub("^[^=]+=\\s*", "", p))
    names(vals) <- keys
    vals
  } else list()
}

run <- function(url, query, body, headers)
{
  #cookies <- cookies(headers)
  #ctx<-ctx = interactive.login("75d29329e023a697d865","88ffc7cc94da1af242391a0ca400d70a8961583b", scopes=c("gist"))
  ctx<-interactive.login("02ac8dc2a994f5a04ad9","dd9fe2c5b677209aad7d3a658fe58b02a1e580ed",scopes=c("gist"))
  me = get.myself(ctx)
  me$public_repos
  star.repository(ctx, "cscheid", "guitar")
  unstar.repository(ctx, "cscheid", "guitar")
  write("/vagrant/work/result.txt","passed")
}


git<-function()
{
  gid<-"4479c7c7270503bb1f5d"
  cid<-"1249782"
  ctx<-create.github.context("a31417e6b4b97fb2cc491880df1d929d18406961")
  r<-delete.gist.comment(gid,cid,ctx)
} 