/*
Author: Prateek
Description:    This is a casperjs automated test script for showing that, Clicking on the Run-All button changes it to Stop button
*/

//Begin Tests

    casper.test.begin("Split a cell and switch to another notebook", 4, function suite(test) {

        var x = require('casper').selectXPath;
        var github_username = casper.cli.options.username;
        var github_password = casper.cli.options.password;
        var rcloud_url = casper.cli.options.url;
        var notebook_id = "95a75c9f62f95adc2469";
		var title;
		var temp;
		var temp1;
        var functions = require(fs.absolute('basicfunctions'));

        casper.start(rcloud_url, function () {
            casper.page.injectJs('jquery-1.10.2.js');
        });
        casper.wait(10000);

        casper.viewport(1024, 768).then(function () {
            functions.login(casper, github_username, github_password, rcloud_url);
        });

        casper.viewport(1024, 768).then(function () {
            this.wait(9000);
            console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
            functions.validation(casper);
        });
        
        //open notebook belonging to some different user
		casper.viewport(1366, 768).thenOpen('http://127.0.0.1:8080/main.html?notebook=' + notebook_id, function () {
        this.wait(10000);
        this.then(function () {
            title = functions.notebookname(casper);
            this.echo("Notebook title : " + title);
            this.wait(3000);
			});
		});

		//get the notebook owner's name and verify that it belongs to a different user
		casper.then(function () {
        var author = this.fetchText({type: 'css', path: '#notebook-author'});
        this.echo("Notebook author: " + author);
        this.test.assertNotEquals(author, github_username, "Confirmed that notebook belonging to different user has been opened");
		});
		
		casper.wait(5000);
		
		casper.then(function(){
			functions.runall(casper);
            temp=this.getElementInfo('#run-notebook > i:nth-child(1)').tag;
            this.echo('Current icon for run all is Play icon' + temp);
        });
        
        casper.wait(10000);
        
        casper.then(function(){
			temp1=this.getElementInfo('#run-notebook > i:nth-child(1)').tag;
            this.echo('Current icon after play icon is stop icon' + temp1);
        });
        
       casper.then(function(){
			if(temp=temp1)
			{
				this.echo("Icon has not been changed from play to stop while execution");
			}
			else{
				this.echo("Icon has been changed from play to stop icon while execution");
			}
		});
        
        casper.run(function () {
            test.done();
        });
    });

