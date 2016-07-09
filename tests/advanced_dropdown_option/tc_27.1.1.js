/* 
 Author: Arko
 Description:    This is a casperjs automated test script to,The existing cells are renamed in GitHub immediately after the user clicks on insert cell
 */
//Begin Tests

casper.test.begin("Reflection of changes in GitHub", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var notebook_id;
    var input = "a<-1000;b<-2000;a+b";

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

    functions.create_notebook(casper);

    functions.addnewcell(casper);

    functions.addcontentstocell(casper, input);

    //open the notebook in Github 
    casper.viewport(1366, 768).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='rcloud-navbar-menu']/li[3]/a"}, 'Opened advanced dropdown');
        this.wait(1000);
        this.waitForSelector({type: 'xpath', path: ".//*[@id='open_in_github']"}, function () {
            console.log("Link for opening notebook in github found. Clicking on it");

            if (this.click({type: 'xpath', path: ".//*[@id='open_in_github']"})) {
                this.wait(10000);
                this.waitForPopup(/gist.github.com/, function () {
                    this.test.assertEquals(this.popups.length, 1);
                });
                this.wait(11000);
                this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
                    this.wait(4000);
                    console.log("The Github url opened: " + this.getCurrentUrl());
                    this.test.assertUrlMatch(/gist.github.com*/, 'Notebook opened in github');
                    this.wait(3000);
                    //verifying that the gist opened belongs to different user
                    var gist_owner = this.fetchText({
                        type: 'css',
                        path: '.author > span:nth-child(1) > a:nth-child(1)'
                    });
                    this.echo(gist_owner + ' is the current owner of the notebook');
                    //this.test.assertEquals(gist_owner, github_username, 'hence confirmed that notebook opened as gist of local user');
                    before_edit = this.fetchText({
                        type: 'xpath',
                        path: ".//*[@id='file-part1-r']/div[1]/div[1]/a/strong"
                    });
                });

            }//if ends
            else {
                console.log('Notebook could not be opened in github');
            }
        });
    });

    casper.wait(3000);

    casper.then(function () {
        var z = casper.evaluate(function () {
            $('.icon-plus-sign').click();
        });
        console.log('Inserting new cell');
		this.wait(4000);
	});
	
	casper.wait(10000).then(function(){
		this.wait(2000);
        this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input);
        console.log('adding acontents to the newly created cell')
        this.click("#save-notebook");
        console.log('Saving the added contents')
        this.wait(3000);
    });

    //open the notebook in Github 
    functions.open_advanceddiv(casper);
    casper.viewport(1366, 768).then(function () {
        this.click({type: 'xpath', path: ".//*[@id='open_in_github']"});
        this.echo('Clicking on link');
        this.wait(10000);
        this.viewport(1366, 768).withPopup(/gist.github.com/, function () {
            this.wait(4000);
            console.log("The Github url opened: " + this.getCurrentUrl());
            
            //verifying that the gist opened belongs to different user
            var gist_owner = this.fetchText({type: 'css', path: '.author > span:nth-child(1) > a:nth-child(1)'});
            this.echo(gist_owner + ' is the current owner of the notebook');
            
            //Verifying whether the added contents are present or not
            this.test.assertSelectorHasText({type: 'xpath', path: ".//*[@id='file-part1-r-LC1']"}, input,"Changes/ Modified made in the notebook are reflecting in GitHub");
        });
    });

    casper.run(function () {
        test.done();
    });
});
