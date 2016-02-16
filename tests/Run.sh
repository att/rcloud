#Session Key Server Setup
cd services
git clone https://github.com/s-u/SessionKeyServer.git
cd SessionKeyServer
sudo make
cd /home/travis/build/prateek032/rcloud/services

sudo sed -i -e '2iROOT=/home/travis/build/prateek032/rcloud\' rcloud-sks
sudo sh rcloud-sks &

Rscript -e 'chooseCRANmirror(ind=81)'
Rscript -e 'install.packages("XML", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
Rscript -e 'install.packages("rcloud.dcplot", repos="http://rforge.net")'
Rscript -e 'install.packages("rpython2", repos="http://rforge.net")'
Rscript -e 'install.packages("xml2", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'

cd /home/travis/build/prateek032/rcloud/tests
#sudo apt-get install xvfb
pwd
echo "Executing testscripts from $1"
sudo xvfb-run -a casperjs test --ssl-protocol=any --engine=slimerjs $1 --username=iPrateek032 --password=musigma12 --url=http://127.0.0.1:8080/login.R --xunit=Reports/report.xml
Rscript parse.R

if [ $? -eq 0 ]
then
  echo "Build Pass"
else
  echo "Build Fail"
exit 1
fi



