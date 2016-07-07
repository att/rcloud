/*

 Author: Prateek
 Description:This is a casperjs automation script for,The loaded notebook will contain Markdown cell 
 * which has been executed. Now, edit the content of that cell and execute it using the 'run' or 'result' icon 
 * present on the side of the cell or using 'ctrl+enter' option from keyboard. Check whether the changes are saved or not
 */
casper.test.begin("Edit markdown Cell (one Rmarkdown cell pre-executed)", 7, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input = "'HAIL'";
    var input1 = "'STORM'";
    var URL;

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

    //Added a markdown cell and enter some content but don't execute them
    functions.addnewcell(casper);

    casper.then(function(){
        this.sendKeys({type:'css', path:"div.edit-markdown > div:nth-child(3) > div:nth-child(1)"}, input);
        this.click({type:'css', path:"#run-notebook"});
        console.log("Contnts are added to the cell and executed it");
    })

    //Fetching the notebook id/URL
    casper.then(function(){
        URL = this.getCurrentUrl();
    });

    //Create a new notebook
    functions.create_notebook(casper);
    casper.wait(2000);

    //Switch back to the previous notebook
    casper.then(function(){
		console.log('Opening previously created  notebook');
        this.thenOpen( URL );
        this.wait(8000);
        functions.validation(casper);
    });
	
    //Fetch the cell contents before modifying it
    casper.then(function(){
		console.log( 'fetching cell details before editing it');
        before = this.fetchText({type:'css', path:'div.edit-markdown > div:nth-child(3) > div:nth-child(1)'});
        
    });

    //Modify the contents of the loaded notebook
    casper.then(function(){
        var z = casper.evaluate(function () {
            $('.icon-edit').click();
        });
        this.sendKeys({type:'css', path:'div.edit-markdown > div:nth-child(3) > div:nth-child(1)'}, input1);
        var z = casper.evaluate(function () {
            $('div.cell-control-bar:nth-child(2) > span:nth-child(2) > i:nth-child(1)').click();
        });
        this.wait(2000);
        console.log('Modified contents are executed');
    });

    //Fetching the cell contents after modifying it
    casper.then(function(){
		console.log( 'fetching cell details after editing it');
        after = this.fetchText({type:'css', path:'div.edit-markdown > div:nth-child(3) > div:nth-child(1)'});
        this.echo(after);
    });

    //Modify the contents of the cell
    casper.then(function () {
        this.test.assertNotEquals(before, after, "Confirmed that content in the markdown cell has been saved after execution");
    });
    
    casper.run(function () {
        test.done();
    });
});
