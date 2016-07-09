/* 
 Author: Prateek
 Description:This is a casperjs automated test script for showing that,The user can import notebooks that are stored in a different repository, 
 * into the current repository and save it having the same name of that notebook. This can be done by selecting the option "Import External Notebooks" 
 * under 'Advanced' drop-down present on the top-right corner of the page. A pop-up window will open. Enter the Source repo api URL and Notebook IDs. 
 * The text for Prefix is left blank. On importing, a notebook will be created in 'My Notebooks' list having the same name of that Notebook
*/

//Begin Tests
casper.test.begin("Import External Notebooks without Prefix", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var Notebook_ID = 'e98a1f2915e86a4c6a43'; // Importing Notebook ID
    var Notebook = 'Reading xls file'; //Importing notebook's name

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

    //open the Advanced Dropdown 
    functions.open_advanceddiv(casper);

    casper.then(function () {
        this.evaluate(function () {
            $('#import_notebooks').click();
        });
        this.echo('opened import notebook dialog box');
        this.wait(2000);
        
        casper.evaluate(function () {
            $('#import-gists').val('9ae0235877d1152511df');
        });
        this.echo('Entering notebook ID');
        this.wait(2000);
        
        this.evaluate(function () {
            $('#import-notebooks-dialog span.btn-primary').click();
            console.log("Clicking on import button");
        });
    });

    casper.wait(2000);

    casper.then(function (){
        var flag = 0;//flag variable to test if the Notebook was found in the div
        var counter = 0;
            do
            {
                counter = counter + 1;
                this.wait(2000);
            } 
            while (this.visible(x("/html/body/div[3]/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/ul/li[1]/ul/li[1]/ul/li[" + counter + "]/div/span[1]")));
            counter = counter - 1;
            for (i = 1; i <= counter; i++) {
                this.wait(5000);
                title = this.fetchText(x("/html/body/div[3]/div/div[1]/div[1]/div/div/div[1]/div[2]/div/div/ul/li[1]/ul/li[1]/ul/li[" + i + "]/div/span[1]"))
                this.echo(title);
                if (Notebook == title) {
                    flag = 1;
                    break;
                }
            }//for closes
            if (flag == 1) {
                this.test.assertEquals(flag, 1, "Imported Notebook " + Notebook +" not found without prefix");
            }
            else {
                this.test.assertEquals(flag, 0, "Imported Notebook " + Notebook +" found without prefix");
            }
    })

    casper.run(function () {
        test.done();
    });
});