/*
 Author: Prateek
 Description: This is a casperjs automated test script for showing that,The Notebook can be imported from a JSON 
 file stored in the local directory of the user. The file can be selected by selecting the option "Import Notebook 
 from File" from the "Advanced" drop-down present in the top-right corner of the page. The user has to validate the 
 file before importing and provide the notebook description. A new notebook will be created with the name given in 
 Notebook Description and added in the 'My Notebooks' list after importing is done
 */
//Begin Tests

casper.test.begin("Import Notebook from File", 5, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var fileName = 'SampleFiles/ggplot-Multiplot.gist'; // File path directory
    var URL, counter, i,v, Notebook,flag;
    var title= "ggplot-Multiplot";
    var system = require('system')
    var currentFile = require('system').args[4];
    var curFilePath = fs.absolute(currentFile);
    var curFilePath = curFilePath.replace(currentFile, '');
    fileName = curFilePath + fileName;

    casper.start(rcloud_url, function () {
        functions.inject_jquery(casper);
    });

    casper.wait(10000);

    casper.viewport(1024, 768).then(function () {
        functions.login(casper, github_username, github_password, rcloud_url);
    });

    casper.wait(4000).then(function () {
        this.wait(3000);
        console.log("validating that the Main page has got loaded properly by detecting if some of its elements are visible. Here we are checking for Shareable Link and Logout options");
        functions.validation(casper);
    });

    casper.then(function (){
        URL = (this.getCurrentUrl());
    })

    casper.then(function (){
        this.thenOpen(URL);
        this.wait(5000);
    });

    casper.wait(2000).then(function () {

        casper.then(function () {
            functions.open_advanceddiv(casper);
            this.click(x(".//*[@id='import_notebook_gist']"));
            this.wait(3000);
        });

        casper.then(function () {
            this.evaluate(function (fileName) {
                __utils__.findOne('input[id="notebook-file-upload"]').setAttribute('value', fileName)
            }, {fileName: fileName});
            this.page.uploadFile('input[id="notebook-file-upload"]', fileName);
            console.log('Selecting a file');
        });

        casper.wait(5000);
    });

    casper.wait(2000).then(function () {
        var temp = this.fetchText("div.container:nth-child(2) > p:nth-child(3) > span:nth-child(1) > input:nth-child(1)");
        this.echo(temp);
        var temp = this.fetchText("#notebook-file-upload");
        this.click(x(".//*[@id='import-notebook-file-dialog']/div/div/div[3]/span[2]"));
        this.wait(3000);
    });

    casper.then(function (){
        flag = 0;//to check if notebook has been found
        var counter = 0;//counts the number of notebooks
        do
        {
            counter = counter + 1;
            this.wait(2000); 
        } while (this.visible({ type:'css', path:'ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+counter+') > div:nth-child(1)'}));
        counter = counter - 1;
        for (v = 1; v <= counter; v++) {
            this.wait(2000);
            var temp = this.fetchText({type:'css', path: 'ul.jqtree_common:nth-child(1) > li:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > ul:nth-child(2) > li:nth-child('+v+') > div:nth-child(1)'});
            temp=temp.substring(0,16);
            // this.echo(temp)
            if (temp == title) {
                flag = 1;
                break;
            }
        }//for closes
        this.test.assertEquals(flag, 1, "Located the newly created notebook");        
    });

    casper.then(function(){
    	if (flag == 1) {
            this.test.assertEquals(flag, 1, "Import Notebook from File, Notebook with title " + title + " is PRESENT under Notebooks tree");
        }
        else {
            this.test.assertEquals(flag, 0, "Import Notebook from File, Notebook with title " + title + " is ABSENT under Notebooks tree");
        }
    });
    
    casper.run(function () {
        test.done();
    });
});