set -x
export ROOT=$HOME/src/rcloud

R CMD Rserve --RS-conf "$ROOT/conf/scripts.conf"

proxy=`R --slave -e 'cat(system.file("libs","forward",package="Rserve"))'`
"$proxy" -p 8080 -s $ROOT/run/qap -r $ROOT/htdocs -u $ROOT/run/ulog -R $ROOT/run/Rscripts

