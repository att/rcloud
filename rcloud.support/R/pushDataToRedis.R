pushDataToRedis<-function(id,d)
{
	library("rjson")
	library("rredis")
	redisConnect(host="localhost",port=6379, password=NULL, returnRef= FALSE, nodelay=FALSE, timeout=2678399L)
	r <- redisGet(id)
	if(is.null(r)){
		parser<-newJSONParser()
		parser$addData(d)
		r<-parser$getObject()
	}else if(typeof(r)=="list"){
		parser<-newJSONParser()
		parser$addData(d)
		d<-parser$getObject()
		r$content <- paste(r$content,d$content,sep=" ")
	}
	redisSet(id,r)
}

