/*
 Author: Prateek
 Description: This is casperjs script showing that,
 * Display the history results containing the links to each version of the corresponding notebook
 */

//Begin Tests

casper.test.begin("History links", 10, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = 'a<-12;b<-12;a+b;';
    var input1= 'c<-12;d<-12;c+d';


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
	
	//Create a new cell
    functions.addnewcell(casper);
	
	//Add contents to the cell and execute it
    functions.addcontentstocell(casper, input);

	//Modify the contents and execute it for the second time
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
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

    casper.run(function () {
        test.done();
    });
});
