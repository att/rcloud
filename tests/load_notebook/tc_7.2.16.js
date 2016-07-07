/*
 Author: Prateek
 Description: After loading a notebook containing some variables (eg. a<-12,b<-13), when a new variable is added in the cell,
 * the new variable which is dependent on a or b will be executed only if the other variable cell are executed after loading.
*/

//Begin Test
casper.test.begin("Accesing pre-existing variables of an uploaded notebook ", 8, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id, notebook_id1;
    var input1 = 'a<-12; b<-12; d<-a+b; d';
    var input2 = 'c<-12; d<-a+b+c; d';
    var expected_output = '36';

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
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
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and  Logout options");
        functions.validation(casper);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        var initial_title = functions.notebookname(casper);
        this.echo("1st Notebook title is : " + initial_title);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebook_id = temp1.substring(41);
        this.echo("The 1st Notebook Id is: " + notebook_id);
    });

    //Creating new cell and adding contents to cell
    casper.then(function () {
        functions.addnewcell(casper);
        functions.addcontentstocell(casper, input1);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        var initial_title = functions.notebookname(casper);
        this.echo("2nd Notebook title is : " + initial_title);
        this.wait(3000);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebook_id1 = temp1.substring(41);
        this.echo("2nd Notebook Id is: " + notebook_id1);
    });

    casper.then(function () {
        var url = this.getCurrentUrl();
        this.thenOpen(url);
        this.wait(5000);
    });

    casper.then(function () {
        functions.open_advanceddiv(casper);
        this.echo("Clicking on dropdown");
        this.wait(2999);
        casper.setFilter("page.prompt", function (msg, currentValue) {
            if (msg === "Enter notebook ID or github URL:") {
                return notebook_id;
            }
        });
        this.click("#open_from_github");
        this.echo("Opening Notebook using Load Notebook ID");
        this.wait(5000);
    });

    functions.validation(casper);
	
	//Creating one more cell
    casper.then(function () {
        this.click({type:'xpath', path:".//*[@id='prompt-area']/div[1]/div/span/i"});
        console.log('Creating one more cell');
        this.wait(2000);
	});
	
	//Adding contents to the newly created cell
	casper.then(function () {
        this.sendKeys({
            type: 'xpath',
            path: ".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"
        }, input2);
        
        functions.runall(casper);
    });
	
	//Fetching the output and comparing it with the expected output
    casper.then(function () {
        this.fetchText(".//*[@id='part2.R']/div[3]/div[2]/pre/code")
        var output = this.fetchText({type: 'xpath', path: ".//*[@id='part2.R']/div[3]/div[2]/pre/code"});
        var result = output.substring(4,6);
        this.test.assertEquals( result, expected_output, "Notebook is produced expected output by accesing pre-existing variables of an uploaded notebook"); 
    });
    casper.run(function () {
        test.done();
    });
});