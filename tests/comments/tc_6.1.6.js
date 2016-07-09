/* 
 Author: Prateek
 Description:    This is a casperjs automated test script to delete a comment for the currently loaded notebook
 */

//Begin Tests


casper.test.begin("Delete comment for a notebook", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var title;//get notebook title
    var functions = require(fs.absolute('basicfunctions'));
    var comment = "AGENT_FURY";//the comment to be entered

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

    //Get notebook title
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //enter the comment
    functions.comments(casper, comment);

    //delete the comment
    casper.then(function () {
        this.click({type: 'css', path: 'i.icon-remove:nth-child(2)'});
        this.wait(4000);
    });


	casper.then(function(){
		this.test.assertSelectorDoesntHaveText({type: 'xpath', path: '/html/body/div[3]/div/div[3]/div[1]/div/div/div[5]/div[2]/div'}, comment, 'Confirmed that entered commment is deleted');
	});
	
	functions.delete_notebooksIstarred(casper);
	
    casper.run(function () {
        test.done();
    });
});
