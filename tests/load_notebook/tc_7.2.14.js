/*
 Author: Prateek
 Description:When a notebook belonging to some different user is loaded, it gets added in the "All Notebooks" div. 
 * The user can view all the history versions of that notebook by clicking on  the 'history' icon present on the side of the Notebook's name and selecting the respective history links
 */

//Begin Test
casper.test.begin("View history versions of the loaded notebook belonging to some different user(before fork)", 10, function suite(test) {
    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var new_username = 'tejas1493';
    var new_user_password = 'musigma12';
    var notebook_id, before, input = 'a<-12; b<-12; c<-12', comment = 'Manikandan P';
    var notebook_status = '(read-only)';

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
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    //Create a new Notebook.
    functions.create_notebook(casper);

    // Getting the title of new Notebook
    casper.then(function () {
        before = this.fetchText('#notebook-author');
        console.log("Author of the Notebook : " + before);
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);
    });

    //getting Notebook ID
    casper.viewport(1024, 768).then(function () {
        var temp1 = this.getCurrentUrl();
        notebook_id = temp1.substring(41);
        this.echo("The Notebook Id: " + notebook_id);
    });

    //Creating cell and adding contents to it
    functions.addnewcell(casper);
    functions.addcontentstocell(casper, input);
    

    casper.then(function () {
        this.click(x(".//*[@id='prompt-area']/div[1]/div/span/i"));
        console.log("Creating onemore cell");
    });

    casper.wait(8000).then(function () {
        this.sendKeys(x(".//*[@id='part2.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input);
        functions.runall(casper);
    })

    //logout of RCloud & Github
    casper.then(function(){
        this.click("#rcloud-navbar-menu > li:nth-child(7) > a:nth-child(1)");
        console.log('Logging out of RCloud');
        this.echo(this.getTitle());
    });

    casper.wait(5000);

    casper.viewport(1366, 768).then(function () {
        this.click(x('/html/body/div[2]/p[2]/a[2]'));
        console.log('Logging out of Github');
        this.wait(12000);
    });

    casper.viewport(1366, 768).then(function () {
        this.waitForSelector('.btn', function () {
            this.click(".btn");
            console.log('logged out of Github');
        });
        this.wait(7000);
        this.echo("The url after logging out of Github : " + this.getCurrentUrl());
        this.waitForSelector("a.btn:nth-child(1)", function (){
            this.wait(3000);
            this.test.assertTextExists('GitHub', "Confirmed that successfully logged out of Github");
            this.echo(this.getTitle());
        });  
    });

    casper.wait(3000);

    //Login to RCloud with new user
    casper.then(function () {
        this.thenOpen('http://127.0.0.1:8080/login.R');
        this.wait(13000);
        functions.login(casper, new_username, new_user_password, rcloud_url);
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
        this.wait(10000);
    });

    casper.then(function () {
        var temp = this.fetchText({type: 'css', path: "#readonly-notebook"});
        this.test.assertEquals(temp, notebook_status, "The notebook which belongs to other user is loaded in Read Only Mode");
    });

    casper.then(function () {
        var star = this.fetchText({
            type: 'css',
            path: ".jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1) > sub:nth-child(2)"
        });
        this.echo('Star count of the notebook is :' + star + 'which belongs to ' + before + ' user ');
    });

    //Check for notebook history 
    casper.then(function () {
        if (this.test.assertVisible({type: 'css', path: '.jqtree-selected > div:nth-child(1) > span:nth-child(1)'})) {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible(('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(2) > i:nth-child(1)'), function () {
                this.wait(2000);
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(2) > i:nth-child(1)');
                console.log("clicking on notebook History icon");
                this.wait(3000);
            });
        } else {
            console.log("Notebook not found");
        }
    });

    casper.wait(8000);

    casper.then(function () {
        this.waitForSelector(".jqtree-selected > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)");
        var temp = this.fetchText({
            type: 'css',
            path: '.jqtree-selected > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)'
        });
        this.echo('History liknk for the Notebook is: ' + temp);
        this.then(function () {
            if (this.exists({
                    type: 'css',
                    path: '.jqtree-selected > ul:nth-child(2) > li:nth-child(1) > div:nth-child(1) > span:nth-child(1)'
                }, "Verifying for history links")) {
                this.test.pass("History link present");
            }
            else {
                this.test.fail("History link is not present");
            }
        });
    });
   
    casper.run(function () {
        test.done();
    });
});
	
	
	
