/*

 Author: Prateek
 Description:This is a casperjs automation script for checking that the loaded notebook containing R cell which has been executed after
 editing the content of that cell and it should be automatically saved after 30 seconds.
 */
casper.test.begin("Edit R Cell (pre-executed)", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var content;//stores initial content of the cell
    var input1 = '"a"';//content to be added to the cell
    var input2 = '"a=12;"';//content to be added while editing
    var URL1 ;//To get the notebook 1 URL
    var temp;//to fetch text
    
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
    
    casper.then(function(){
		URL1 = this.getCurrentUrl();
	});

    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);
        combo = github_username + ' / ' + title;
    });

    //Added a new cell and execute the contents
    functions.addnewcell(casper);

    //Add contents to this cell and then execute it using run option
    functions.addcontentstocell(casper, input1);
    
    
    //Creating one more notebook
    functions.create_notebook(casper);
    
    // Getting the title of new Notebook
    casper.then(function () {
        title = functions.notebookname(casper);
        this.echo("Notebook title : " + title);
        this.wait(2000);
        combo = github_username + ' / ' + title;
    });
    
    //Loading previously executed noteook
    casper.then(function(){
		this.thenOpen( URL1);
		this.echo('Opening Previously executed notebook');
	});
	
	casper.wait(8000);
	
	//Modify contents to this cell and then execute it using run option
    casper.viewport(1366, 768).then(function () {
		this.click(x(".//*[@id='part1.R']/div[2]/div[2]/span[2]/i"));
        this.sendKeys(x(".//*[@id='part1.R']/div[3]/div[1]/div[2]/div/div[2]/div"), input2);
    });

    functions.runall(casper);

    //Waiting for 30 seconds to help auto-save work
    casper.then(function () {
        initialcontent = this.fetchText({
            type: 'css',
            path: 'html body div#main-div.container.nopad div.row div#middle-column.no-padding.col-md-4.col-sm-4 div#rcloud-cellarea div#output.tab-div.ui-sortable div#part1.R.notebook-cell div div.source-div div.outer-ace-div div.edit-code.ace_editor.ace-chrome.active div.ace_scroller div.ace_content div.ace_layer.ace_marker-layer div.ace_active-line'
        });
        this.wait(30000);
    });

    //Reloading the page
    casper.viewport(1366, 768).then(function () {
        this.wait(30000);
        this.reload(function () {
            this.echo("Main Page loaded again");
            this.wait(8000);
        });
    });

    //Checking the R cell contents
    casper.viewport(1366, 768).then(function () {
        //checking whether contents are written on Rcell or not
        temp = this.fetchText(x(".//*[@id='part1.R']/div[3]/div[2]/pre/code"));

        this.test.assertNotEquals(temp, input1, "Confirmed that content in the R cell has been saved by Autosave feature");
    });

    //functions.delete_notebooksIstarred(casper);
    casper.run(function () {
        test.done();
    });
});
