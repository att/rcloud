/*
 Author: Prateek
 Description: When a notebook is declared as public, it can be converted into private by clicking on
 * the icon "make private" present on the side of the name of the notebook
 */

//Begin Tests
casper.test.begin(" Select 'make private' icon to make notebook private", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
    var before;// To fetch the icon details
    var after;// To fetch the icon details after clicking on public/private icon

    casper.start(rcloud_url, function () {
        casper.page.injectJs('jquery-1.10.2.js');
    });
    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });
    
    casper.waitUntilVisible('#run-notebook', function () {
		this.echo('waiting for page to open completely');
	});

    casper.viewport(1024, 768).then(function () {
        this.wait(9000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);

    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
	});

    //fetching notebbok deatils before clicking on private icon
    casper.then(function(){
        before = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
    });


    //Making the notebbok public/private
    casper.then(function(){
        if (this.test.assertVisible({type:'css', path:'.jqtree-selected > div:nth-child(1) > span:nth-child(1)'}))
        {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(3) > i:nth-child(1)', function () {
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(3) > i:nth-child(1)');
                this.echo('Making notebook as private by clicking on icon');
            });

        }else
        {
            console.log("Notebook not found");
        }
    });

    //fetching notebbok deatils after clicking on private icon
    casper.then(function(){
        after = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
    });

    casper.then(function(){
        if ( before != after)
        {
            console.log('Notebook icon has changed from public to private');
        }else
        {
            console.log('Notebook icon has not changed so, the notebook is still public only');
        }
    });

    casper.run(function () {
        test.done();
    });
});






