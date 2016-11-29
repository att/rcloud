/*

 Author: Arko
 Description:When there is no comment for a given notebook, the count for the number of comments will be zero, present
 in the right-side of the page

 */

//Begin Test
casper.test.begin(" Count of comments =0 when no comments are written ", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var title;
    var functions = require(fs.absolute('basicfunctions'));

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

    //open comments div if not open
    casper.then(function () {
        if (this.visible('#comments-wrapper')) {
            this.echo('Comment div is open');
            this.wait(5000);

        }
        else {
            this.echo('Comment div is not open,hence opening it');
            this.wait(5000);
            var z = casper.evaluate(function () {
                $('.icon-comments').click();
            });
            this.wait(5000);
        }
    });

    //Without entering any text in comment box click on comment button
    casper.then(function () {
        this.click({ type : 'xpath' , path : '//*[@id="comment-submit"]'});
        this.echo('Clicking on comment button without entering any text');
        this.wait(2000);
        this.test.assertNotVisible(x(".//*[@id='comments-container']/div/div[2]/div/div"),'No comments are written');
    });
    
    functions.delete_notebooksIstarred(casper);

    casper.run(function () {
        test.done();
    });
});
