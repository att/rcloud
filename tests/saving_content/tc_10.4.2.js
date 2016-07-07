/*

 Author: Kunal
 Description:This is a casperjs automation script for checking that when a new markdown cell is created and some code is written in the cell.
 After executing the the cell using the 'Run All' icon present on the top-left corner of the page will reflect the changes made to
 the Rmarkdowm cell
 */
casper.test.begin("New markdown cell (Not executed)", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var cellcontent = "654";//content to be added while modifying the cell

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

    //change the language from R to Markdown
    casper.then(function(){
        this.mouse.click({ type: 'xpath' , path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
        this.wait(2000);
    });

    //selecting Markdown from the drop down menu
    casper.then(function(){
        this.evaluate(function() {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 0;
            $(form).change();
        });
    });

    //Added a markdown cell and enter some content but don't execute
    functions.addnewcell(casper);
    casper.then(function () {
        this.sendKeys('div.ace-chrome:nth-child(1) > textarea:nth-child(1)', cellcontent);
        this.echo("entered contents to the markdown cell");
        this.wait(2000);
    });

    functions.runall(casper);

    casper.viewport(1366, 768).then(function () {
        //checking whether contents are written on markdowncell or not
        var temp = this.fetchText({
            type: 'css',
            path: '#part1\.md > div:nth-child(3) > div:nth-child(2)'
        });
        this.echo(temp);
        this.test.assertSelectorHasText({type:'xpath', path:".//*[@id='part1.md']/div[3]/div[2]/p"},cellcontent, "Confirmed that content in the markdown cell has been saved using Run All feature");
    });

    casper.run(function () {
        test.done();
    });
});
