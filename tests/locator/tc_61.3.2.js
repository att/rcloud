/*
 Author: Sanket (tc_61.3.1.js)
 Description: This is casperJS automated test to check whether locator() returns fewer than requested coordinates
 */

//Begin

casper.test.begin("Return fewer than requested points", 6, function suite(test) {
    var page = require('casper').create();
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "plot(1:10) \n locator(2)";
    // var page=x.create();

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

    //add a new cell and execute its contents
    functions.addnewcell(casper);

    functions.addcontentstocell(casper,input_code);

    // casper.wait(2000).then(function(){
    //     this.mouse.click({type: 'css',path:'.live-plot'}, {keepFocus: true})
    //     this.wait(1000).then(function(){
    //         this.page.sendEvent("keypress", casper.page.event.key.Ecsape);
    //     })
        
    // });
    
    // casper.wait(2000).then(function(){
    //     this.evaluate(function(){
    //         var esc = $.Event("keydown",{ keyCode: '27' });
    //         $("body").trigger(esc);​
    //     });
    // });

    casper.wait(2000).then(function(){
        this.mouse.click({ 
            type:'css',
            path:'.live-plot'
        });
        
        this.wait(3000).then(function(){
            var z = casper.evaluate(function triggerKeyDownEvent() {
                var e = jQuery.Event("keydown");
                e.which = 27;
                e.keyCode = 27;
                jQuery(".live-plot").trigger(e);
                return true;
            });
        });        
    });

    casper.wait(1000).then(function(){
        this.test.assertVisible({
            type:'css',
            path:'.icon-circle'
        },'locator() returned fewer than requested points');
        this.wait(3000)
    });

    //Delete the cell created for this test case
    casper.then(function(){
        this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
        this.wait(2000)
        this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(5) > i:nth-child(1)')
    });

    casper.run(function () {
         test.done();
    });
});
    


