#Session Key Server Setup
cd services
git clone https://github.com/s-u/SessionKeyServer.git
cd SessionKeyServer
sudo make
cd /home/travis/build/RCloudatt/rcloud/services

sudo sed -i -e '2iROOT=/home/travis/build/RClodatt/rcloud\' rcloud-sks
sudo sh rcloud-sks &

Rscript -e 'chooseCRANmirror(ind=81)'
Rscript -e 'install.packages("XML", repos=c("http://RForge.net", "http://R.research.att.com"), type="source")'
Rscript -e 'install.packages("rcloud.dcplot", repos="http://rforge.net")'
Rscript -e 'install.packages("rpython2", repos="http://rforge.net")'

cd /home/travis/build/RCloudatt/rcloud/tests
#sudo apt-get install xvfb
pwd
echo "Executing testscripts from $1"
sudo xvfb-run -a casperjs test --ssl-protocol=any --engine=slimerjs $1 --username=RCloudatt --password=musigma12 --url=http://127.0.0.1:8080/login.R --xunit=Reports/report.xml

echo -e "Starting to update AUTOMATION_REPORTS\n"
#copy data we're interested in to other place
cp -R /home/travis/build/RCloudatt/rcloud/tests/Images $HOME/Images

  #go to home and setup git
cd $HOME
git config --global user.email "travis@travis-ci.org"
git config --global user.name "travis"

#using token clone gh-pages branch
git clone --quiet --branch=AUTOMATION_REPORTS https://${GH_TOKEN}@github.com/RCloudatt/rcloud.git  AUTOMATION_REPORTS > /dev/null

  #go into diractory and copy data we're interested in to that directory
cd AUTOMATION_REPORTS
cp -Rf $HOME/Images/* ./tests/Images/

  #add, commit and push files
git add -f .
git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to AUTOMATION_REPORTS"
git push -fq origin AUTOMATION_REPORTS > /dev/null
echo -e "The test images are uploaded \n"
cd /home/travis/build/RCloudatt/rcloud/tests/
Rscript parse.R

if [ $? -eq 0 ]
then
  echo "Build Pass"
else
  echo "Build Fail"
exit 1
fi



