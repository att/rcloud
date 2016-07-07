/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,Upload an Asset with .py extension and write some python codes in it. 
 On pressing ctrl+enter, the codes written in Asset will get executed in a new python cell to achieve the expected output
 */
//Begin Tests

casper.test.begin("Upload an Asset and run a python code", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var fileName = '/home/fresh/FileUpload/PHONE.csv'; // File path directory    
    var URL; 
    var input = 'a=5 ; print a';

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


    //create a new notebook
    functions.create_notebook(casper);

    casper.then(function (){
        URL = (this.getCurrentUrl());
    });

    //Verifying whether file upload div is open or not
    casper.then(function () {
        if (this.visible(x(".//*[@id='file']"))) {
            this.echo('File Upload pane div is open');
            this.wait(5000);
        }
        else {
            this.echo('File upload div is not open,hence opening it');
            this.wait(6000);
            this.click(x(".//*[@id='accordion-right']/div[2]/div[1]"));
            this.wait(5000);
        }
    });

    casper.then(function (){
        this.thenOpen(URL);
        this.wait(6000);
    })
    casper.then(function () {
        this.click("#upload-to-notebook");
        this.wait(2000);
        console.log("Clicking on checkbox");
        this.evaluate(function (fileName) {
            __utils__.findOne('input[type="file"]').setAttribute('value', fileName)
        }, {fileName: fileName});
        this.page.uploadFile('input[type="file"]', fileName);
        console.log('Selecting a file');
    });

    casper.then(function () {
        this.wait(5000, function () {
            this.click(x(".//*[@id='upload-submit']"));
            console.log("Clicking on Submit icon");
        });
    });

    //change the language from R to Python
    casper.then(function(){
        this.mouse.click({ type: 'xpath' , path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
        this.wait(2000);
    });
    
    //selecting Python from the drop down menu
    casper.then(function(){
        this.evaluate(function() {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 2;
            $(form).change();
        });
        console.log('Python Language is selected from the drop down menu');
    });

    //create a new cell
    functions.addnewcell(casper);
    
    //adding python code in to the cell
    casper.then(function(){
        this.sendKeys(x(".//*[@id='part1.py']/div[3]/div[1]/div[2]/div/div[2]/div"),input);
        this.wait(2000);
    });
    
    //to run the code
    functions.runall(casper);

    casper.wait(3000);
    
    //Verifying the output for the code
    casper.wait(4000).then(function(){
        this.test.assertExists({type:'xpath', path:".//*[@id='part1.py']/div[3]/div[2]/span"},'Python code has produced expected output');
    });

    casper.run(function () {
        test.done();
    });
});

