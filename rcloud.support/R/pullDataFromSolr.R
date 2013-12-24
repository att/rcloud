#1910 ::: This code pulling the data from Redis and push it in SOLR, this has to be called as backend process
#1910 ::: need to have error handling : as of now not implemented yet.

pullDataFromSolr<-function(q){
	library("rjson")
	library("RCurl")
	solr_url <- paste("http://localhost:8983/solr/select?q=",q,"&wt=json",sep="")
	solr_res<-getURL(solr_url)
	
#1910 ::: Attempting to send a response as JSON object.... :)
	return(solr_res)
}

#pushDataToSolrFromRedis("2a421fe9879cba73d210")
