/*

 Author: Prateek
 Description:This is a casperjs automation script for checking that the loaded notebook containing Rmarkdown cell which has been executed after
 editing the content of that cell and it should be automatically saved after 30 seconds.
 */
casper.test.begin("Edit Markdown Cell (pre-executed)", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var content;//stores initial content of the cell
    var input1 = '"HouseFull"';//content to be added to the cell
    var input2 = '"FULLhouse"';//content to be added while editing
    var URL1 ;//To get the notebook 1 URL

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

    //Added a markdown cell and enter some content execute it
    functions.addnewcell(casper);

    casper.then(function () {
        this.sendKeys('div.ace-chrome:nth-child(1) > textarea:nth-child(1)', input1);
        this.wait(2000);
        functions.runall(casper);
    });

    casper.then(function(){
        URL1 = this.getCurrentUrl();
    });


    //creating one more notebook
    functions.create_notebook(casper);

    //switching back to previously executed notebook
    casper.then(function(){
        this.thenOpen( URL1 );
    });

    casper.wait(9000);

    casper.then(function () {
        var z = casper.evaluate(function () {
                $('.icon-edit').click();
			});
		this.echo("Clicking on toggle edit button to edit the executed cell");
        this.sendKeys('div.ace-chrome:nth-child(1) > textarea:nth-child(1)', input2);
        this.wait(2000);
        //Waiting for 30 seconds to help auto-save work
        casper.then(function () {
           beforesave = this.fetchText({
                type: 'css',
                path: 'div.ace-chrome:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1)'
            });
            this.wait(30000);
        });
    });

	casper.wait(5000);
		
	//Checking the markdiwn cell contents
	casper.viewport(1366, 768).then(function () {
		this.wait(2000);
		//checking whether contents are written on markdown cell or not
		aftersave = this.fetchText({
			type: 'css',
			path: 'div.ace-chrome:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1)'
		});
		this.test.assertEquals(beforesave, aftersave, "Confirmed that the edited cell content in the markdown cell has been saved by Autosave feature");
	});

	casper.run(function () {
		test.done();
	});
});
