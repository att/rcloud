/*

 Author: Prateekl
 Description:The notebook will contain two or more RMarkdown cells, each with some code which are already executed .Execute them using Run All option

 */
casper.test.begin("Execute two or more Markdown cells pre executed using Run All", 8, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var input_code = "hello" ;
    

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

    //Change the language of prompt cell to Markdown cell. Select 1 for markdown and 2 for python
    casper.then(function () {
       this.evaluate(function() {
            var form = document.querySelector('.form-control');
            form.selectedIndex = 0;
            $(form).change();
        });
    });

    //Added a new markdown cell and execute contents
    casper.wait(2000).then(function () {
        functions.addnewcell(casper);
    });

    //Add some content to markdown cell and execute cell
    casper.wait(1000).then(function () {
        this.wait(1000).then(function(){
            this.sendKeys({type:'xpath', path:".//*[@id='part1.md']/div[3]/div[1]/div[2]/div/div[2]/div"}, input_code); 
            this.echo("Entered code into the cell but did not execute it yet");
        });
        this.wait(1000).then(function(){
            this.click(x(".//*[@id='part1.md']/div[2]/div[2]/span[1]/i"));
        });
    });

    //Add another markdown cell
    casper.wait(2000).then(function () {
        functions.addnewcell(casper);
    });

    //Add some content to markdown cell and execute cell
    casper.wait(1000).then(function () {
        this.wait(1000).then(function(){
            this.sendKeys({type:'xpath', path:".//*[@id='part2.md']/div[3]/div[1]/div[2]/div/div[2]/div"}, input_code); 
            this.echo("Entered code into the cell but did not execute it yet");
        });
        this.wait(1000).then(function(){
            this.click(x(".//*[@id='part2.md']/div[2]/div[2]/span[1]/i"));
        });
    });
    
    casper.wait(2000).then(function () {
        functions.runall(casper);
	});

    //Verify the output
    casper.then(function () {
        this.test.assertVisible('div:nth-child(3) > div:nth-child(2) > p:nth-child(1)', "Output div is visible which means that cell execution has occured successfully");
		for ( var i =1; i<=2 ; i++)
		{
			var result = this.fetchText({type: 'xpath', path: ".//*[@id='part"+i+".md']/div[3]/div[2]/p"});//fetch the output after execution
			this.test.assertEquals(result, input_code, "The code executed in Markdown cell has produced the expected output using Run All for cell "+i);        
			this.wait(4000);
		}		
    });

    casper.run(function () {
        test.done();
    });
});
