/* 
 Author: Sanket
 Description:    This is a casperjs automated test script for counting no of comments 
 
 */
casper.test.begin(" Total number of comments", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var title;//get notebook title
    var functions = require(fs.absolute('basicfunctions'));
    var comment = "First comment";//the comment to be entered
    var cmt=3; // number of comments to be printed
    var cm_cnt=0; // count of detected comments
    
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
        this.wait(4000);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    //Get notebook title
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });
   // Adding the comments
	casper.then(function(){
			for (var i=1;i<=cmt;i++){
			functions.comments(casper, comment);
		    this.wait(2000);
			}// for loop closed
	});
	
	
	//this.wait(5000);
	casper.then(function () {
            do
            {
                cm_cnt = cm_cnt + 1;
                this.wait(2000);
            } while (this.visible('div.comment-container:nth-child('+cm_cnt+') > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)'));
            cm_cnt = cm_cnt - 1;
            this.echo("number of comments results:" + cm_cnt);
            
            this.test.assertEquals(cm_cnt,3, 'comment count verified');
        });
        
        functions.delete_notebooksIstarred(casper);
        
        casper.run(function () {
        test.done();
    });
});
		

	
