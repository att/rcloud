/*
 Author: Prateek
 Description:  This is a casperjs automated test script for showing that,Clicking the individual run of the cell
 for multiple cells shows output of the cells executed in the order of execution
*/

//Test begins
casper.test.begin(" Individual cells produces respective output even after clicking on individual click of run", 6, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = 'a<-50\n a';
    var title;

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
    // functions.create_notebook(casper);

    //Enter the code in command prompt cell
    casper.then(function(){
        this.sendKeys("#command-prompt > div:nth-child(3) > div:nth-child(1)", input_code);
        this.wait(2000);
	});
	//getting the notebook title and modifying it
    casper.viewport(1024, 768).then(function () {
        title = functions.notebookname(casper);
        this.echo("Present title of notebook: " + title);

        // this.wait(3000).then(function(){
        //     var z = casper.evaluate(function triggerKeyDownEvent() {
        //         var e = jQuery.Event("keydown");
        //         e.which = 13;
        //         e.keyCode = 13;
        //         jQuery("#command-prompt > div:nth-child(3) > div:nth-child(1)").trigger(e);
        //         return true;
        //     });
        // });    

        casper.wait(2000).then(function(){
            // this.mouse.click({type: 'css',path:'.live-plot'}, {keepFocus: true})
            this.wait(1000).then(function(){
                this.page.sendEvent("keypress", casper.page.event.key.Escape);
            });
        });
        // this.evaluate(function () {
        //     $(function ()
        //     {
        //         $(document).on("keydown", "#textareaId", function(e)
        //         {
        //             if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey)
        //             {
        //                 alert('ctrl+enter');
        //             }
        //         });
        //     });
        // });
	});
        
        casper.wait(10000);
   

   //Verifying the results
    casper.then(function(){
        this.test.assertSelectorHasText({type : 'css' , path: '.r-result-div>pre>code'}, input_code,"The code is executed from command propmt");
        this.wait(5000);
        console.log("Output is present");
    });

    casper.run(function () {
        test.done();
    });
});
