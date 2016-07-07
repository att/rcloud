/*
Auther : Prateek
Description:    This is a casperjs automated test script for showing that,Under the Data frame div, present in the right-side panel,
* if new data frame is opened, scrollbar should be displayed under the data frame div
*/

//begin test
casper.test.begin("Checking whether scroll bar exist for the generated data frame", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebookid;//to get the notebook id
	var input1="x = c(2, 3, 5,8,10,11,13,14,15,16,17,18);df = data.frame(x);print(df)"; // code1
	
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
			this.test.assertSelectorHasText(x(".//*[@id='viewer-body']"),"11","Dataframe contents is displayed");	
		});
	});

	casper.then(function (){
		console.log('Now checking whether scrollbar exist for current data frame or not')
		this.wait(2000);
		if(this.test.assertExists(x(".//*[@id='viewer-scroller']"),'checking whether scrollbar exists or not')){
		this.test.pass('scroll bar exists for dataframe');
		}else{
		this.test.fail('scroll bar does not exists for current data frame');
		}
	});
		
	casper.run(function () {
        test.done();
    });
});
