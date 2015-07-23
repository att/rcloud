/*
 Author: Arko   (tc_4.3.2)
 Description:Notebook containing more than one R cell with some code which is already executed and
 Run all button is then clicked and checked whether all the R cells are executed or no.
 */
casper.test.begin("Execute one or more R cells pre executed using Run All", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "a<-50+50;a" ;
    var expected_result = "100";
    
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

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Added a new R cell and execute contents
    casper.then(function () {
		//create 1st cell
        this.click({type:"xpath", path:"/html/body/div[3]/div/div[2]/div/div[3]/div[1]/div/span/i"});
        this.wait(3000);
        //create 2nd cell
        this.click({type:"xpath", path:"/html/body/div[3]/div/div[2]/div/div[3]/div[1]/div/span/i"});
        //create 3rd cell
        this.click({type:"xpath", path:"/html/body/div[3]/div/div[2]/div/div[3]/div[1]/div/span/i"});
	});
	casper.then(function(){
        this.wait(2000);
        //Adding contents to the cell
        this.click({type:'xpath', path:"/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]/div[2]/div/div[2]/div"});
        this.sendKeys({type:'xpath', path:"/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]/div[2]/div/div[2]/div"}, input_code);
        console.log('adding contents to the 1st cell')
		this.wait(3000);
		//Adding contents to the cell
		this.click({type:'xpath', path:"/html/body/div[3]/div/div[2]/div/div[1]/div[3]/div[3]/div[1]/div[2]/div/div[2]/div"});
		this.sendKeys({type:'xpath', path:"/html/body/div[3]/div/div[2]/div/div[1]/div[3]/div[3]/div[1]/div[2]/div/div[2]/div"}, input_code);
		console.log('adding contents to the 2nd cell')
    });

	functions.runall(casper);
    
    //verifying for output console
    casper.then(function () {
        this.test.assertVisible('.r-result-div>pre>code', "Output div is visible which means that cell execution has occured successfully");
    });

	casper.run(function () {
        test.done();
    });
});
