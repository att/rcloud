/*
 Author: Prateek
 Description:This is a casperjs automation script for,Create a new Markdown cell in the loaded notebook and write some code in it. 
 * Now, execute the cell using the 'run' or 'result' icon present on the side of the cell
 * Check whether the changes are saved or not
*/
casper.test.begin("New Markdown cell (Not executed))", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = '"RAJANI"';
    var after;

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

    functions.addnewcell(casper);

    //Adding contents to the cell
    casper.wait(3000).then(function () {  
        this.waitForSelector(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
            this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input);
        });
    });
    
    //change the language from R to Markdown
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
    
    casper.wait(2000).then(function (){
        this.click(x(".//*[@id='save-notebook']"));
    });

	casper.wait(3000).then(function(){
		after = this.fetchText({
            type: 'css',
            path: 'div.ace-chrome:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(1)'
        });
	});
	
	casper.then(function(){
		this.test.assertEquals(input, after, "Confirmed that content in the Markdown cell has been saved after execution");
    });
    

    casper.run(function () {
        test.done();
    });
});
