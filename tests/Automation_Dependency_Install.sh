#!/bin/bash

# Install the testing bed (Slimerjs,Casperjs and Phantomjs ) if not already installed
# Initial check
if  [[  ( -f /usr/local/bin/phantomjs ) && ( -f /usr/local/bin/slimerjs ) && ( -f /usr/local/bin/casperjs )  ]]
then
	echo "** All the required dependancies are present"
	echo "**Phantomjs"
	echo "**Slimerjs"
	echo "**Casperjs"
else

    # System Identification
    check=$(uname -m)
    test="i686"
    if [ $test = $check ]
    then
        echo "The system is 32 bit";
        flag=1;
    else
        echo "The system is 64 bit";
        flag=0;
    fi

    #Creating directory
    read -p "Enter the directory path for installation: " path

    cd
    cd ${path}
    mkdir Automation_Installation    
    cd Automation_Installation
    pwd

    # Installation of Phantomjs
    if [ -f /usr/local/bin/phantomjs ];
    then
        echo "**Phantomjs exist."
    else
        echo "*Phantomjs does not exist. Hence installing it"
        if [ $flag = 1 ]
        then
            echo "1"
            wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-i686.tar.bz2
            tar -xvjf phantomjs-1.9.8-linux-i686.tar.bz2
            sudo ln -s `pwd`/phantomjs-1.9.8-linux-i686 /usr/local/share/phantomjs
            sudo ln -s /usr/local/share/phantomjs/bin/phantomjs /usr/local/bin/phantomjs
            v1=$(phantomjs --version)
            if [ $v1 = 1.9.8 ]
            then
                echo "***Phantomjs is installed successfully***"
            else
                echo "**Phantomjs is not installed properly**"
                sudo rm /usr/local/bin/phantomjs
		sudo rm /usr/local/share/phantomjs
            fi
        else
            echo "0"
            wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.8-linux-x86_64.tar.bz2
            tar -xvjf phantomjs-1.9.8-linux-x86_64.tar.bz2
            sudo ln -s `pwd`/phantomjs-1.9.8-linux-x86_64 /usr/local/share/phantomjs
            sudo ln -s /usr/local/share/phantomjs/bin/phantomjs /usr/local/bin/phantomjs
            v1=$(phantomjs --version)
            if [ $v1 = 1.9.8 ]
            then
                echo "***Phantomjs is installed successfully***"
            else
                echo "**Phantomjs is not installed properly**"
                sudo rm /usr/local/bin/phantomjs
		sudo rm /usr/local/share/phantomjs
            fi
       fi
    fi
    # Instalaltion of Slimerjs
    if [ -f /usr/local/bin/slimerjs ];
    then
       echo "**Slimerjs exist."
    else

       echo "*Slimerjs does not exist. Hence installing it..."
       if [ $flag = 1 ];
       then
            echo "1"
            wget http://download.slimerjs.org/releases/0.9.6/slimerjs-0.9.6-linux-i686.tar.bz2
            tar -xvjf slimerjs-0.9.6-linux-i686.tar.bz2
            sudo ln -s `pwd`/slimerjs-0.9.6 /usr/local/share/slimerjs
            sudo ln -s /usr/local/share/slimerjs/slimerjs /usr/local/bin/slimerjs
            v2=$(slimerjs --version)
            tmp=$(echo $v2 | cut -c 18-22)
            if [ $tmp = 0.9.6 ]
            then
                echo "***Slimerjs is installed successfully***"
            else
                echo "**Slimerjs is not installed properly**"
                sudo rm /usr/local/bin/slimerjs
		sudo rm /usr/local/share/slimerjs
            fi
       else
            echo "0"
            wget http://download.slimerjs.org/releases/0.9.6/slimerjs-0.9.6-linux-x86_64.tar.bz2
            tar -xvjf slimerjs-0.9.6-linux-x86_64.tar.bz2
            sudo ln -s `pwd`/slimerjs-0.9.6 /usr/local/share/slimerjs
            sudo ln -s /usr/local/share/slimerjs/slimerjs /usr/local/bin/slimerjs
            v2=$(slimerjs --version)
            tmp=$(echo $v2 | cut -c 18-22)
            if [ $tmp = 0.9.6 ];
            then
                echo "***Slimerjs is installed successfully***"
            else
                echo "**Slimerjs is not installed properly**"
                sudo rm /usr/local/bin/slimerjs
		sudo rm /usr/local/share/slimerjs
            fi
        fi
    fi
    # Installation of Casperjs

    if [ -f /usr/local/bin/casperjs ];
    then
       echo "**Casperjs exist."
    else
        echo "*Casperjs does not exist. Hence installing it..."
        sudo apt-get install git -y                             # installing dependancy 'git'
        git clone https://github.com/n1k0/casperjs.git
        cd casperjs
        sudo ln -sf `pwd`/bin/casperjs /usr/local/bin/casperjs
        v3=$(casperjs --version)
        tmp2=$(echo $v3 | cut -c 1-11)
        if [ $tmp2 = 1.1.0-beta3 ]
        then
            echo "***Casperjs is installed successfully***"
        else
            echo "**Casperjs is not installed properly**"
            sudo rm /usr/local/bin/casperjs
        fi
    fi
fi

