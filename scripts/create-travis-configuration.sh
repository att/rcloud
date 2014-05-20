rm -f conf/rcloud.conf
echo "Host: 127.0.0.1" >> conf/rcloud.conf
echo "github.client.id: $1" >> conf/rcloud.conf
echo "github.client.secret: $2" >> conf/rcloud.conf
echo "github.base.url: https://github.com/" >> conf/rcloud.conf
echo "github.api.url: https://api.github.com/" >> conf/rcloud.conf
echo "github.gist.url: https://gist.github.com/" >> conf/rcloud.conf
echo "rcs.engine: redis" >> conf/rcloud.conf
