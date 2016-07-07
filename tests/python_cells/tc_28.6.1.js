/*
 Author: Prateek
 Description: This is casperjs automated test script showing that,Split option will divide a python cell into two new python cells.
 */

//Begin Test
casper.test.begin("Splitting a python cell", 7, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = '"GABBAR IS BACK"';
    var input2 = '"BACK IS GABBAR"';

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

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, input);

    //change the language from R to Python
    casper.then(function () {
        this.mouse.click({type: 'xpath', path: ".//*[@id='prompt-area']/div[1]/div/select"});//x path for dropdown menu
        this.echo('clicking on dropdown menu');
        this.wait(2000);
    });

    //selecting Python from the drop down menu
    casper.then(function () {
        this.evaluate(function () {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 2;
            $(form).change();
        });
        console.log('Python Language is selected from the drop down menu');
    });

    casper.then(function () {
        this.reload();
        this.wait(5000);
    });

    casper.then(function () {
        functions.runall(casper);
    })

    //Creating one more cell ablove the cell
    casper.wait(3000).then(function () {
        this.click(x(".//*[@id='part1.py']/div[1]/span[1]/i"));
        this.wait(3000);
        this.waitForSelector(x(".//*[@id='part1.py']/div[3]/div[1]/div[2]/div/div[2]/div"), function () {
            this.sendKeys(x(".//*[@id='part1.py']/div[3]/div[1]/div[2]/div/div[2]/div"), input2);
        })

    })

    //to run the code
    functions.runall(casper);

    // //Create one more cell
    // functions.addnewcell(casper);

    // //add contents to the cell
    // casper.then(function(){
    // 	this.sendKeys({type:'xpath', path:'/html/body/div[3]/div/div[2]/div/div[1]/div[2]/div[3]/div[1]/div[2]/div/div[2]/div'}, input2);
    // });

    casper.then(function () {
        this.click(x(".//*[@id='part2.py']/div[1]/span[2]/i"));
        console.log("Joining 1st and 2nd cells");
    });

    casper.then(function () {
        this.test.assertDoesntExist(x(".//*[@id='part2.py']/div[2]"), 'Second cells doesnot exists');
    });

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
        this.echo("clicking on toggle edit button of 1st cell");
    });

    //clicking split icon
    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-unlink').click();
            this.echo("clicking on split icon");
            this.wait(5000);
        });
    });

    //Verifying whether second cell exists or not
    casper.wait(4000).then(function () {
        this.test.assertExists(x(".//*[@id='part2.py']/div[2]"), 'Second cells exists after splitting');
    });

    casper.run(function () {
        test.done();
    });
});
