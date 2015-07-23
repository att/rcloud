# Automation Guide

## Installation of dependancies
* Following are the dependancies required to execute the automation scripts:
    * CasperJS
    * SlimerJS
    * PhantomJS
    

* The above mentioned dependancies can be installed using the installation script provided with the package (**Automation_Dependency_Install.sh**) 
* command to execute the installation script: 

```sh
	$ sudo bash data/rcloud/test/Automation_Dependency_Install.sh
```  
* This script will expect the desired path of the directory where the dependancies will be installed. (e.g "/home/user/directory_name") 

## Execution of the automation scripts
- **RCloud must started to execute the automation scripts**
- Below is the command used for execution of the automation test scripts:

```sh
	$ cd data/rcloud/test
```
- With UI

```sh
	$ sudo casperjs test --engine=slimerjs testsuite_name/testcase_name.js --username=github_username --password=github_password --url=rcloud_url --xunit=testsuite_name/report_name.xml
```
- Without UI (headless)

```sh
	$ sudo xvfb-run -a casperjs test --engine=slimerjs testsuite_name/testcase_name.js --username=github_username --password=github_password --url=rcloud_url --xunit=testsuite_name/report_name.xml
```
- rcloud_url e.g.: "http://127.0.0.1:8080/logn.R"

* The XML report will be generated in respective testsuite directory

## For more reference :
- [CasperJS] (http://casperjs.readthedocs.org/en/latest/)
- [SlimerJS] (http://slimerjs.org/)
- [PhantomJS] (http://phantomjs.org/)
