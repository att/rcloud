/*
 Author: Prateek 
 Description:The loaded notebook contains Prompt cell(cell present with sign">" at the bottom )with some code and is not executed.
 * On clicking the 'Run All' icon present on the top-left corner of the page, the content stay as it is and do not get executed.
 */
//Begin Test

casper.test.begin("Clicking on run all button when some part of the code in command propmt cell", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "hello";

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
    
    casper.then(function (){
		casper.then(function () {
			if(this.visible({type:'xpath', path:".//*[@id='command-prompt']/div[2]/div"}))
			{
				console.log('Command prompt is enabled');
			}else
			{
				console.log('Commamd prompt is disabled hence enabling it');
				if(this.visible('div.checkbox:nth-child(1)'))
				{
					console.log("Setting div is already opened");
				}else
				{			
					var z = casper.evaluate(function () {
						$('#accordion-left > div:nth-child(3) > div:nth-child(1)').click();
					});
					console.log('Opening settings div');
					this.wait(2000);
				}
					var z = casper.evaluate(function () {
						$('div.checkbox:nth-child(1) > label:nth-child(1) > input:nth-child(1)').click();
					});
				console.log('Enabling Command prompt');
				this.wait(3000);
			}
		});
	});

    casper.then(function () {
		this.click('#run-notebook');
		this.wait(4000);
		this.then( function () {
			this.sendKeys({type: 'xpath', path: ".//*[@id='command-prompt']/div[2]/div"}, input_code);
		});

        functions.runall(casper);
    });

    casper.then(function () {
		this.wait(3000);
        this.test.assertSelectorHasText({type: 'xpath', path: ".//*[@id='command-prompt']/div[2]/div"}, input_code);
    });

    casper.run(function () {
        test.done();
    });
});
