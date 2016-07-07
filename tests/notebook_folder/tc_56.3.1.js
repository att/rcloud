casper.test.begin("Fork option visibility ",4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var counter=0;
    

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.viewport(1024, 768).then(function () {
        this.wait(2000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and RCLoud logo");
        functions.validation(casper);
        this.wait(2000);
    });

    functions.create_notebook(casper);

    casper.then(function () {
        this.wait(3000)
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("##1/Notebook");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
        this.wait(4000);
    });

    
    casper.then(function(){
        for (var i=0;i<5;i++){
            var t=this.fetchText('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+i+') > div:nth-child(1) > span:nth-child(2)')
            if(t=='##1'){
                counter=i;
                break;
            }
        }               
    });



    casper.wait(2000).then(function () {
        this.echo(counter);
        if (this.test.assertVisible({
                type: 'css',
                path: '.jqtree-selected > div:nth-child(1)'
            })) {
            console.log('selected notbook found');
            this.mouse.move('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+counter+') > div:nth-child(1) > span:nth-child(2)');
            this.waitUntilVisible(('ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+counter+') > div:nth-child(1) > span:nth-child(3) > span:nth-child(1) > span:nth-child(1) > span:nth-child(1) > i:nth-child(1)'), function () {
                this.wait(2000);
                console.log("Folder forking icon is visible");
                this.wait(3000);
            });
        } else {
            console.log("Folder forking not found");
        }
    });

    casper.then(function () {
        var z = casper.evaluate(function triggerKeyDownEvent() {
            jQuery("#notebook-title").text("Notebook");
            var e = jQuery.Event("keydown");
            e.which = 13;
            e.keyCode = 13;
            jQuery("#notebook-title").trigger(e);
            return true;
        });
    });

    casper.run(function () {
        test.done();
    });
});
