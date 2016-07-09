/*

 Author: Prateek
 Description:This is a casperjs automation script for checking The loaded notebook will contain R cell which has been executed.
 Now, edit the content of that cell and execute it using the 'run' or 'result' icon present on the side of the cell
 or using 'ctrl+enter' option from keyboard. Check whether the changes are saved or not.
 */
casper.test.begin("Edit R Cell (one R cell pre-executed)", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var initialcontent;//stores initial content of the cell
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

    //Added a new cell and execute the contents
    functions.addnewcell(casper);

    casper.wait(3000);
    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, cellcontent);
    
    //Clicking on the Edit button and make changes to the earlier executed code
    casper.then(function () {
        initialcontent = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[1]/div[1]/pre/code"));

        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
        this.wait(2000);
        this.echo("modify the contents of the cell");
    });

    //modify contents of the cell
    casper.then(function (){
        this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), cellcontent);
    })

    //storing the modified content of the cell
    casper.then(function () {
        // var z = casper.evaluate(function () {
        //     $('.icon-edit').click();
        // });
        this.click(x(".//*[@id='save-notebook']"));
        this.wait(4000);       
    });

    //Checking the R cell contents
    casper.viewport(1366, 768).then(function () {
        //checking whether contents are written on Rcell or not
        var temp = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[1]/div[1]/pre/code"));
        this.test.assertNotEquals(temp, initialcontent, "Confirmed that content in the R cell has been saved after execution");
    });
    
    casper.run(function () {
        test.done();
    });
});
