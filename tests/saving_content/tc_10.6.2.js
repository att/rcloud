/*

 Author: Prateek
 Description:This is a casperjs automation script for,When any cell in a notebook is edited, the "save" 
 * icon present on the top-left corner of the page gets enabled. After 30 seconds, the icon is automatically disabled
 */
casper.test.begin("auto disable save icon)", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var initialcontent;//stores initial content of the cell
    var temp;
    var cellcontent = "654";//content to be added while modifying the cell
    var before;
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

    //Added a R cell and execute contents
    casper.then(function () {
        functions.addnewcell(casper);

        //functions.addcontentstocell(casper);
        casper.viewport(1366, 768).then(function () {
            this.sendKeys('div.ace-chrome:nth-child(1) > textarea:nth-child(1)', cellcontent);
            this.echo('adding contents to the cell');
            this.wait(3000);
        });
    });
    
    //Fetching Element information when save icon is enabled
    casper.then(function(){
		before = this.getElementInfo({type:'xpath' ,path:".//*[@id='save-notebook']"}).tag;
		this.echo('Fetching save icon Element information when save icon is enabled');
	});
	casper.echo('Waiting for 30 seconds to help auto-save work');
	//Waiting for 30 seconds to help auto-save work
	casper.wait(30000);
    
    //Fetching Element information after 30seconds
    casper.then(function () {
        after = this.getElementInfo({type:'xpath' ,path:".//*[@id='save-notebook']"}).tag;
		this.echo('Fetching save icon Element information after 30seconds');
	});
    
    casper.then(function(){
		if ( before != after)
		{
			this.test.pass(" save icon is disabled");
		}else
		{
			this.test.fail("save icon is enabled");
		}
	});
			
    casper.run(function () {
        test.done();
    });
});
