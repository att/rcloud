/*

 Author: Arko
 Description:This is a casperjs automation script to create a new Rmarkdown cell in the loaded notebook and write some code in it. The 'save' 
 icon present in the navbar on the top-left corner of the page will be enabled. Click on the icon and check whether the changes are saved
 or not
 */
casper.test.begin("Using save icon present in the navbar - New markdown cell (Not executed)", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var cellcontent = "654";//content to be added while modifying the cell
    var cell_content = "Cell contents adding to Markdown";

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

    functions.addnewcell(casper);
    functions.addcontentstocell(casper, cell_content);

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

    casper.then(function (){
        this.reload();
        this.wait(5000);
    });

    casper.then(function(){
        this.waitForSelector(x(".//*[@id='part1.md']/div[3]/div[1]/div[1]/pre/code"), function (){
            // this.sendKeys(x(".//*[@id='part1.md']/div[3]/div[1]/div[1]/pre/code"), cell_content);
            console.log("Cell contents added");
        });
    });
    //click on the save icon
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('#save-notebook').click();
        });
        this.wait(10000);
        console.log('Save icon is clicked');
    });

    
    casper.viewport(1366, 768).then(function () {
        //checking whether contents are written on markdowncell or not
        this.test.assertSelectorHasText(x(".//*[@id='part1.md']/div[3]/div[1]/div[1]/pre/code"), cell_content, "Confirmed that content in the markdown cell has been saved using Run All feature");
    });

    casper.run(function () {
        test.done();
    });
});
