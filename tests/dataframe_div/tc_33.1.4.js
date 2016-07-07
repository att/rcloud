/*
Auther : Prateek
Description:This is a casperjs automated test script for showing that,Under the Data frame div, present in the right-side panel, if new data frame is opened,
* it will be displayed in the data frame div replacing the existing data frame
*/

//Begin Test
casper.test.begin("Checking whether existing dataframe is replaced with new dataframe or not", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input1="x = c(2, 3, 5);n = c('aa', 'bb', 'cc');b = c(TRUE, FALSE, TRUE);df = data.frame(x, n, b); y = c(2, 3, 5);n = c('aa', 'bb', 'cc');b = c(FALSE, FALSE, TRUE);df1 = data.frame(y, n, b)"; // code1
	var dataframe ;
	var dataframe1;
    
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
	casper.then(function(){
		this.wait(1000);
		var z = casper.evaluate(function () {
			$('#enviewer-body > table:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > a:nth-child(1)').click();//clicking dataframe link
			});
		this.echo('clicking on first dataframe');
		this.wait(8000);
	});

	casper.then(function(){
		dataframe = this.fetchText({type:'css', path:'#viewer-body'});
	});
	
	casper.then(function(){
		var z = casper.evaluate(function () {
			$('#enviewer-body > table:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > a:nth-child(1)').click();
			this.wait(5000);
		});
		this.echo('clicking on second dataframe');
		this.wait(8000);
	});

	casper.then(function(){
		dataframe1 = this.fetchText({type:'css', path:'#viewer-body'});
		this.echo('second dataframe contents');
	});
	
	casper.then(function(){
		if (dataframe==dataframe1)
		{
			console.log('dataframe has not been replaced with new dataframe');
		}else
		{
			console.log('dataframe has been changed with the new dataframe');
		}
	});
	casper.run(function () {
        test.done();
    });
});

