/*
 Author: Prateek
 Description:When a notebook is declared as private, it can be converted into public by clicking on the icon "make public" 
 * present on the side of the name of the notebook
 */

//Begin Tests
casper.test.begin("Select 'make public' icon to make notebook public", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var title;
    var before;// To fetch the icon details 
    var after;// To fetch the icon details after clicking on public/private icon

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
        initial_title = functions.notebookname(casper);
        this.echo("New Notebook title : " + initial_title);

    });

    //fetching notebbok deatils before clicking on private icon
    casper.then(function(){
        before = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
        this.echo( before );
    });


    //Making the notebbok public/private
    casper.then(function(){
        if (this.test.assertVisible({type:'css', path:'.jqtree-selected > div:nth-child(1) > span:nth-child(1)'}))
        {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(3) > i:nth-child(1)', function () {
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(3) > i:nth-child(1)');
                this.echo('Making notebook as private by clicking on icon');
            });

        }else
        {
            console.log("Notebook not found");
        }
    });

    //fetching notebbok deatils after clicking on private icon
    casper.then(function(){
        after = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
        this.echo( after );
    });

    casper.then(function(){
        if ( before != after)
        {
            console.log('Notebook icon has changed from public to private');
        }else
        {
            console.log('Notebook icon has not changed so, the notebook is still public only');
        }
    });
    
    casper.then(function(){
		if (this.test.assertVisible({type:'css', path:'.jqtree-selected > div:nth-child(1) > span:nth-child(1)'}))
        {
            console.log('selected notbook found');
            this.mouse.move('.jqtree-selected > div:nth-child(1) > span:nth-child(1)');
            this.waitUntilVisible('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(4) > i:nth-child(1)', function () {
                this.click('.jqtree-selected > div:nth-child(1) > span:nth-child(2) > span:nth-child(3) > span:nth-child(1) > span:nth-child(4) > i:nth-child(1)');
                this.echo('Making notebook as Public by clicking on icon');
            });
        }else
        {
            console.log("Notebook not found");
        }
    });
    
    //Comparing icon deatils after making it public from private notebook
    casper.then(function(){
		var icon = this.getElementInfo('.jqtree-selected > div:nth-child(1) > span:nth-child(1)').tag;
		if ( icon == before)
		{
			console.log('The notebook is converted into Public notebook from private notebook');
		}else
		{
			console.log('Notebook is still private');
		}
	});
		
		

    casper.run(function () {
        test.done();
    });
});






