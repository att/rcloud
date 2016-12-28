#Session Key Server Setup
cd services
git clone https://github.com/s-u/SessionKeyServer.git
cd SessionKeyServer
sudo make
cd /home/travis/build/att/rcloud/services

sudo sed -i -e '2iROOT=/home/travis/build/att/rcloud\' rcloud-sks
sudo sh rcloud-sks &

sudo Rscript -e 'chooseCRANmirror(ind=81)'
sudo Rscript -e 'install.packages("XML", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
sudo Rscript -e 'install.packages("rcloud.dcplot", repos="http://rforge.net")'
sudo Rscript -e 'install.packages("rpython2", repos="http://rforge.net")'
sudo Rscript -e 'install.packages("xml2", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
sudo Rscript -e 'install.packages("drat", repos="https://cran.rstudio.com")'
sudo Rscript -e 'install.packages("devtools", repos="http://RForge.net")'
sudo Rscript -e 'devtools::install_github("hadley/devtools")'
sudo Rscript -e 'install.packages("rcloud.rmd", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
sudo Rscript -e 'install.packages("rcloud.shiny", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
sudo Rscript -e 'install.packages("rcloud.htmlwidgets", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
sudo Rscript -e 'install.packages("rcloud.flexdashboard", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'

cd /home/travis/build/att/rcloud/tests
#sudo apt-get install xvfb
pwd
echo "Executing testscripts from $1"
sudo xvfb-run -a casperjs test --ssl-protocol=any --engine=slimerjs $1 --username=att-MuSigma --password=musigma12 --url=http://127.0.0.1:8080/login.R --xunit=Reports/report.xml
Rscript parse.R

if [ $? -eq 0 ]
then
  echo "Build Pass"
else
  echo "Build Fail"
exit 1
fi