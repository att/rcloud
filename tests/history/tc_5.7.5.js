/*
 Author: Prateek
 Description: This is casperjs script showing that,Click on the Fork icon present in the navbar. It should create and add a new notebook 
 * under My Notebooks with same name, of the same history version of the Notebook which was forked 
 */

//Begin Tests
casper.test.begin("Fork the history version of notebook", 15, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a<-100;b<-500;a+b;';
    var input1= '\nc<-2000;d<-1000;c+d';
    var title;
    var initial_title;

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1364, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1364, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    //create a new notebook
    functions.create_notebook(casper);
    
    //Get title of currently loaded notebook
    casper.viewport(1366, 768).then(function () {
        initial_title = functions.notebookname(casper);
        this.echo("Title of currently created Notebook : " + initial_title);
        this.wait(3000);
    });    
	
	//Create a new cell
    functions.addnewcell(casper);
	
	//Add contents to the cell and execute it
    functions.addcontentstocell(casper, input);

	//Modify the contents and execute it for the second time
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
        console.log("clicking on toggle button to add contents again");
        this.sendKeys({type: 'css', path: "div.edit-code > div:nth-child(3) > div:nth-child(1)"}, input1);
    });
    functions.runall(casper);
    
    //Check for notebook history 
    casper.then(function () {
        if (this.test.assertVisible({type: 'css', path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'})) 
        {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible(('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(2) > i:nth-child(1)'), function () {
                this.wait(2000);
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(2) > i:nth-child(1)');
                console.log("clicking on notebook History icon");
                this.wait(3000);
            });
        } else 
        {
            console.log("Notebook not found");
        }
    });

    casper.then(function(){
        var i;
        for (i = 1; i <= 2; i++) {
            var temp = this.fetchText({type: 'css',path: '.jqtree-selected > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'});           
            if (this.test.assertExists({type: 'css',path: '.jqtree-selected > ul:nth-child(2) > li:nth-child(' + i + ') > div:nth-child(1) > span:nth-child(1)'}, "Verifying for history links"))
            {
                this.test.pass("History links are present");
            }
            else
            {
                this.test.fail("History links are not present");
            }
        }
    });
    
    //Loading History version and verifying with Revert back icon for history notebook
    casper.then(function(){
		this.click('.jqtree-selected > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)');
		console.log('Clicking on first history links ');
		this.wait(4000);
		if(this.test.assertExists({type:'css', path:'#revert-notebook'},"verifying whether Revert back icon"))
		{
			this.test.pass("History version of a perticular notebook is loaded");
		}else
		{
			this.test.fail("Failed to load History version of a notebook");
		}
	});
	
	//Forking the loaded History version Notebook
	functions.fork(casper);
	
	//Fetch the notebook title after forking
	casper.viewport(1024, 768).then(function () {
        this.wait(4000);
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.wait(3000);
        this.test.assertNotEquals(current_title, initial_title, "After forking notebook title has been changed");
        this.echo("Notebook owner = " + this.fetchText({type: 'css', path: '#notebook-author'}));
    });
    
    casper.run(function () {
        test.done();
    });
});
	
	
	
	
	
