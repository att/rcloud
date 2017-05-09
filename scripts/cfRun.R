require ('rjson')

if (Sys.getenv('VCAP_SERVICES') != '') {
    vcap_services = fromJSON(Sys.getenv('VCAP_SERVICES'))
    redis_service = vcap_services$`p-redis`[[1]]$credentials
    redis_host = sprintf("%s:%s", redis_service$host, redis_service$port)
    redis_password = redis_service$password
} else {
    redis_host = 'localhost:6379'
    redis_password = ''
}

port = if (Sys.getenv('PORT') != '') Sys.getenv('PORT') else 8080
root = Sys.getenv('ROOT')

sed <- function(find, replace, file) {
    darwin_sed = if(Sys.info()['sysname'] == 'Darwin') '""' else NULL
    system2('sed', args = c('-i', darwin_sed, paste0('"s|', find, '|', replace, '|"'), file))
}

rserve_conf_file = paste0(root, '/conf/rserve.conf')
rcloud_conf_file = paste0(root, '/conf/rcloud.conf')

sed('http.port [[:digit:]]*', paste('http.port', port), rserve_conf_file)
sed('rcs.redis.host: .*', paste('rcs.redis.host:', redis_host), rcloud_conf_file)
sed('rcs.redis.password: .*', paste('rcs.redis.password:', redis_password), rcloud_conf_file)
system2('grep', args = c('-q', '-F', '"daemon disable"', rserve_conf_file, '||', 'echo', '"daemon disable"', '>>', rserve_conf_file))

system2(paste(root, 'conf/start', sep = '/'))
