/* 
 Author: Arko
 Description:    This is a casperjs automated test script to load the main page of Rcloud given that the user is not logged-in to the Github account. 
 The 'login.R' page will be re-directed to the Github page asking for credentials and then it will load the main page of Rcloud
 */

//Begin Tests

casper.test.begin("Login to Main page (user is not logged-in to the Github account)", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "a<-50+50 ; a";
    var expectedresult = "100"

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
        this.wait(4000);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Get notebook title
    casper.then(function () {
        var title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //add a new cell and execute its contents
    functions.addnewcell(casper);
    functions.addcontentstocell(casper,input_code);
    
    
    //open the Advanced Dropdown 
    casper.then(function(){
		functions.open_advanceddiv(casper);
		this.echo("clicking on Dropdown");
	});
	
	casper.then(function(){
		// this.click("#export_notebook_gist");
        this.echo("Export notebook as R file option has been clicked");
    });

    casper.then(function () {
        this.echo("Session div message after Exporting the notebook as R file :");
        this.echo(this.fetchText({type: 'css', path: '#session-info-out'}));
        var text = this.fetchText({type:'xpath', path:".//*[@id='session-info-panel']"});
        this.echo(text);
        //this.test.assertTextExists({type:'xpath', path:".//*[@id='session-info-panel']"},"output file", "Confirmed that notebook successfully exported as R file");
    });
    
    casper.run(function () {
        test.done();
    });
});
