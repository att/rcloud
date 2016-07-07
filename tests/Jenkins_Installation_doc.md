# Installation of Jenkins and configuration

## Installation
Following steps can be followed to install Jenkins
```sh
$ wget -q -O - https://jenkins-ci.org/debian/jenkins-ci.org.key | sudo apt-key add -
$ sudo sh -c 'echo deb http://pkg.jenkins-ci.org/debian binary/ > /etc/apt/sources.list.d/jenkins.list'
$ sudo apt-get update
$ sudo apt-get install jenkins
```

After this Jenkins will be started on port 8080 which is the default port for Jenkins
To go to the 'Jenkins Dashboard' go to http://localhost:8080


# Starting/Stopping/Restarting Jenkins

Jenkins starts by default each time when you start the system. But you may need to stop/restart Jenkins after installing certain plugins or even when changing the port

```sh
$ sudo /etc/init.d/jenkins start/stop/restart
```

## Changing port for Jenkins
Since Rserve runs on 8080 we need another port for Jenkins, For this follow the steps:

- Stop Jenkins on 8080 by the above command
- Then we need to make some changes in the jenkins file
```sh
$ cd /etc/default
```
- In the 'jenkins' file replace 8080 by any port you wish to use e.g. 9090
- Restart jenkins
- Go to http://localhost:{YOUR_PORT}

**** THE DIRECTORY WHICH JENKINS WORKS IN IS ``` /var/lib/jenkins ```. 
 ALL JOBS, PLUGINS AND INSTALLATIONS ARE PRESENT IN THIS FOLDER ITSELF ****

## Plugins
You can install new plugins from the Jenkins Dashboard, by clicking the 'Manage Jenkins' tab and further the 'Manage Plugins' Tab.
Right now we have installed 'Github' plugins, 'NodeJS Plugin', 'Template Project Plugin'and the 'Junit Plugin'

## Basic Installation of casperjs slimerjs and phantomjs
Here you can configure the jenkins system for installations for slimerjs casperjs and other such packages
- Go to 'Manage Jenkins' on the Jenkins Dashboard
- Go to 'Global tool configuration '
- Under the 'NodeJS' section, click 'NodeJS Installations' or 'Add Installer' or any option available.
Here we create and configure different node instances. We can make multiple node instances as many required containing dependencies and packages for our projects. For our project we will create one installing casperjs, slimerjs and phantomjs
- From 'Add Installer' select 'Install from nodejs.org'
- Select the node version you wish to install
- Then enter the package name you wish to install separated by a space. In our case 'casperjs slimerjs phantomjs'. This will install these packages globally when a build is made for the first time.
- Apply and Save these changes

*** AGAIN NOTE THAT THIS NODE INSTANCE AND PACKAGES WILL BE INSTALLED IN ```/var/lib/jenkins/tools/jenkins.plugins.nodejs.tools.NodeJSInstallation ```****

## Creating a new Project/Job

- From Jenkins Dashboard create a new job. Select 'Freestyle Project'
- Now the 'Project Configuration' page will open. Here you can specify the project details.
- We now make the first build for installation of the above node and its packages
- For that in 'Build Environment' section, check 'Provide Node & npm/bin folder to PATH and select the node you created
- Now under 'Build' section , you write your scripts, maybe nodejs or shell or any scripts mentioned in the dropdown. You can select that by adding build steps.

Once this build is done, we can run our shellscripts or shell commands to run our test suite in the same 'Build step'. 

The installation will not run again. It is a one time thing. 

You can create as many node instances with as many packages required for your project and also invoke the required node instance as per project requirement.

## Jobs
For our application, we need 3 basic  jobs viz. to install the dependencies, pull the required branch to test and building and starting Rcloud.
- The first job will have the node instance which will install slimerjs, phantomjs and casperjs from node
- The second job will pull the recent commits from the required branch as mentioned
- The third job will build and start Rcloud

We will have another job which will run our testsuite. This job will be parameterized and ask for parameters like name of the branch to be pulled, GitHub username and password of the user.

This job will then call other 3 jobs in the above sequence using the Template Project Plugin.
- In the 'Build' Section, add a build step using 'Use builders from another project' and mention the job name you wish to call.
- Then finally add the 'Execute shell' step with the command to run the testsuite.

Then we need to apply these changes and save

Finally build the last project.

## Test Reports

If a test creates a .xml report using 'xunit' as in our case, then the 'Junit Plugin can be used to analyse the reports created by the casperjs test.

For this we must create a workspace for our builds which will used to store analyse the report data. This can be done in the 'Advanced Project options' while configuring our testing job. We have to specifiy the path where the report is created.

Secondly, in 'Post-Build Actions', we must select 'Publish the Junit test result report' and mention the .xml file and tick the 'Retain long standard output/error' box

This will create a 'Latest test result' option on the Status page of the project which will show the details of all the builds which created the reports. 

## Troubleshooting
There are certain issues with the Jenkins versions.

So if there are any abnormalities we need to uninstall and install jenkins again. Please note that the projects, build data and setup wont be lost.This can simply be done by 
```sh
$ sudo apt-get remove --auto-remove jenkins
```

And again install Jenkins using the above 4 steps at the top.

No more port changes and setup required.

For further information regarding project set up on jenkins [click here] (https://wiki.jenkins-ci.org/display/JENKINS/Building+a+software+project)