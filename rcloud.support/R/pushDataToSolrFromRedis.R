#1910 ::: This code pulling the data from Redis and push it in SOLR, this has to be called as backend process
#1910 ::: need to have error handling : as of now not implemented yet.

pushDataToSolrFromRedis<-function(id)
{
	library("rjson")
	library("rredis")
	redisConnect(host="localhost",port=6379, password=NULL, returnRef= FALSE, nodelay=FALSE, timeout=2678399L)
	redis_res<-redisGet(id)	
	#parser<-newJSONParser()
	#parser$addData(redis_res)
	valid_redis_res<-redis_res #parser$getObject()
	#part_appended_content<-""
	#for(i in 1 : (length(valid_redis_res$files)-1)){ 
	#	current_value <- gsub("\"","\\\"",valid_redis_res$files[[i]]$content)
	#	part_appended_content <- paste(part_appended_content,current_value,sep=" ")
	#}
	
	curlTemplate <- "curl http://localhost:8983/solr/update?commitWithin=5000 -H 'Content-type:application/json' -d '[{\"id\":\"v_id\", \"user\":\"v_user\", \"user_url\":\"v_user_url\", \"created_at\":\"v_created_at\", \"updated_at\":\"v_updated_at\", \"commited_at\":\"v_commited_at\", \"content\":\"v_content\", \"url\":\"v_url\", \"avatar_url\":\"v_avatar_url\", \"followers\":\"v_followers\", \"description\":\"v_description\", \"size\":\"v_size\", \"public\":\"v_public\"}]'" 
	curlCommand <- gsub("v_id",valid_redis_res$id,curlTemplate)
	curlCommand <- gsub("v_user_url","XX-USER-URL",curlCommand)
	curlCommand <- gsub("v_user",valid_redis_res$user,curlCommand)	
	curlCommand <- gsub("v_created_at","2013-12-17T13:48:48Z",curlCommand)
	curlCommand <- gsub("v_updated_at","2013-12-17T13:48:48Z",curlCommand)
	curlCommand <- gsub("v_commited_at","2013-12-17T13:48:48Z",curlCommand)
	curlCommand <- gsub("v_content",valid_redis_res$content,curlCommand)
	curlCommand <- gsub("v_url","valid_redis_res$url",curlCommand)
	curlCommand <- gsub("v_avatar_url","valid_redis_res$user$avatar_url",curlCommand)
	curlCommand <- gsub("v_followers","0",curlCommand)
	curlCommand <- gsub("v_description","valid_redis_res$description",curlCommand)
	curlCommand <- gsub("v_size","10",curlCommand)
	curlCommand <- gsub("v_public","TRUE",curlCommand)
	
	system(curlCommand)
	redisClose()
}

#pushDataToSolrFromRedis("277577010200e6a129f6")
