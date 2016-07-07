/*
Auther : Tejas
Description:    This is a casperjs automated test script for showing that Under the Dataframe div, present in the right-side panel, 
if the values of the variables in the code is changed it should be updated  in the Dataframe div
*/

//begin test
casper.test.begin("Display updated variable value in dataframe div", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
	var input1="x = c(2, 3, 5);n = c('aa', 'bb', 'cc');b = c(TRUE, FALSE, TRUE);df = data.frame(x, n, b);print(df)"; // code1
	var input2="x = c(200, 300, 500);n = c('ARNAB', 'SEN', 'GUPTA');b = c(TRUE, FALSE, TRUE);df = data.frame(x, n, b);print(df)"; // code2
    
    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    //login to Github and RCloud
    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

	//Creating new notebook
	functions.create_notebook(casper);
	
	//Creating a new cell
	functions.addnewcell(casper);
	
	//Add contents to the created cell and execute it
	functions.addcontentstocell(casper, input1);
	
	//Opening workspace div
	casper.then(function  () {
		if (this.visible({type: 'xpath', path: '//*[@id="enviewer-body-wrapper"]'})){
			console.log('workspace div is open');
			}
			else{
			var y = casper.evaluate(function () {
                $('#accordion-right .icon-sun').click();
			});	
			console.log("workspace div was not opened hence clicking on it");
			}
	});
	
	//check data frame in dataframe div
	casper.then(function (){
		var z = casper.evaluate(function () {
			$("#enviewer-body > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)").click();//clicking dataframe link
			this.echo('clicking on dataframe');
			});
	});

	casper.wait(4000).then(function (){
		this.waitForSelector(x(".//*[@id='viewer-body']"), function (){
			this.test.assertSelectorHasText(x(".//*[@id='viewer-body']"),"TRUE","Dataframe contents is displayed");	
		});
	});
	
	//Creating one more cell
	casper.then(function(){
		this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
		this.echo('created one more cell');
		this.wait(5000);
		this.waitForSelector(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), function (){
			this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input2)
		});
		functions.runall(casper);
	});
	
	//check data frame in dataframe div
	casper.then(function (){
		var z = casper.evaluate(function () {
			$("#enviewer-body > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)").click();//clicking dataframe link
			this.echo('clicking on dataframe');
			});
	});

	casper.wait(4000).then(function (){
		this.waitForSelector(x(".//*[@id='viewer-body']"), function (){
			this.test.assertSelectorHasText(x(".//*[@id='viewer-body']"),"ARNAB","Dataframe contents is displayed");	
		});
	});
	
	casper.run(function () {
        test.done();
    });
});
	
	
			
	
	
	
		



