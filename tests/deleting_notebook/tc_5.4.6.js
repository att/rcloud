/* 
 Author: Sanket
 Description:    The 'Notebooks' div contains two or more notebooks. On deleting the
 notebook which is starred and currently not loaded in the main page, it simply gets deleted and the currently loaded notebook
 remains loaded
 */

//Begin Tests
casper.test.begin("Delete notebook which is not loaded and unstarred", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
    var initial_title;
    var v;

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

    // Getting the title of new Notebook and unstarring it
    casper.then(function () {
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
        this.wait(3000);
        var z = casper.evaluate(function () {
            $('#star-notebook .icon-star').click();
        });
    });

    casper.wait(1000).then(function(){
        initial_title=this.fetchText('.jqtree-selected > div:nth-child(1)');
        // this.echo(initial_title);
        functions.checkstarred(casper);

    });    
    
    //Creating another New notebook
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("New Notebook title : " + title);
        this.wait(3000);
    });

    //checking if first created notebook is present in the People I Starred list and deleting it
    casper.then(function () {
        var flag = 0;//to check if notebook has been found
        var counter = 0;//counts the number of notebooks
        do
        {
            counter = counter + 1;
            this.wait(2000); 
        } while (this.visible({ type:'css', path:'ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+counter+') > div:nth-child(1)'}));
        counter = counter - 1;
        for (v = 1; v <= counter; v++) {
            this.wait(2000);
            var temp = this.fetchText({type:'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+v+') > div:nth-child(1)'});
            
            if (temp == initial_title) {
                flag = 1;
                break;
            }
        }//for closes
        this.test.assertEquals(flag, 1, "Located the newly created notebook");
    });
        //deleting the notebook
        casper.then(function(){
            this.wait(3000);
            this.mouse.move('ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + v + ') > div:nth-child(1)');
            this.waitUntilVisible('ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + v + ') > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)', function () {
            this.click('ul.jqtree_common:nth-child(1) > li:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(' + v + ') > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)');
        });
        this.echo("Deleted the newly created notebook with title " + initial_title);
    });

       
    //checking if the currently loaded notebook is still loaded
    casper.viewport(1024, 768).then(function () {
        var current_title = functions.notebookname(casper);
        this.echo("Title of currently loaded Notebook : " + current_title);
        this.wait(2000);
        this.test.assertEquals(title, current_title, "currently loaded notebook is still loaded");
    });

    casper.run(function () {
        test.done();
    });
});
