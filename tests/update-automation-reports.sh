echo -e "Starting to update AUTOMATION_REPORTS\n"
#copy data we're interested in to other place
cp -R /home/travis/build/iPrateek032/rcloud/tests/Images $HOME/Images

  #go to home and setup git
cd $HOME
git config --global user.email "travis@travis-ci.org"
git config --global user.name "travis"

#using token clone gh-pages branch
git clone --quiet --branch=AUTOMATION_REPORTS https://${GH_TOKEN}@github.com/iPrateek032/rcloud.git  AUTOMATION_REPORTS > /dev/null

  #go into diractory and copy data we're interested in to that directory
cd AUTOMATION_REPORTS
cp -Rf $HOME/Images/* ./tests/Images/

  #add, commit and push files
git add -f .
git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to AUTOMATION_REPORTS"
git push -fq origin AUTOMATION_REPORTS > /dev/null
echo -e "The test images are uploaded \n"
