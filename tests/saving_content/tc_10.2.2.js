/*

 Author: Prateek
 Description:This is a casperjs automation script for checking that after creating a new Rmarkdown cell in the loaded notebook and writing some code in it.
 The content should automatically be saved after 30 seconds
 */
casper.test.begin("New Markdown cell (Not executed)", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var initialcontent = '"hello"';//stores initial content of the cell
    var beforesave;
    var aftersave;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Change the language of prompt cell to Markdown cell. Select 0 for markdown and 2 for python
    casper.then(function(){
		this.mouse.click({ type: 'xpath' , path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
		this.echo('clicking on dropdown menu');
		this.wait(2000);
	});
	
	//selecting Markdown from the drop down menu
	casper.then(function(){
		this.evaluate(function() {
			var form = document.querySelector('.form-control');
			form.selectedIndex = 0;
			$(form).change();
		});
	});

    //Added a markdown cell and enter some content but don't execute them
    functions.addnewcell(casper);
    casper.then(function () {
        this.sendKeys('div.ace-chrome:nth-child(1) > textarea:nth-child(1)', initialcontent);
        this.wait(2000);
    });

    //Waiting for 30 seconds to help auto-save work
    casper.then(function () {
        beforesave = this.fetchText({
            type: 'xpath',
            path: '/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div'
        });
        this.echo(beforesave);
        this.wait(30000);
    });

    casper.wait(30000);

    //Checking the MArkdown cell contents
    casper.viewport(1366, 768).then(function () {
        //checking whether contents are written on markdown cell or not
        aftersave = this.fetchText({
            type: 'xpath',
            path: '/html/body/div[3]/div/div[2]/div/div[1]/div/div[3]/div[1]/div[2]/div/div[2]/div'
        });
	});
	
	casper.wait(2000);
	
	casper.then(function(){
        this.echo(aftersave);
        this.test.assertEquals(aftersave, beforesave, "Confirmed that the un-executed cell content in the Markdown cell has been saved by Autosave feature");
    });

    
    casper.run(function () {
        test.done();
    });
});
