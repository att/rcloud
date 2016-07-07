/* 
 Author: Prateek
 Description: This is a casperjs automated test script for showning that,The search results should be 
 * sorted wrt to the 'name' that is with respect to Username  in descending order
 */

//Begin Tests

casper.test.begin("Sorting the searched results according to 'Name' in 'descnding' order", 4, function suite(test) {

    var x = require('casper').selectXPath;
    var github_username = casper.cli.options.username;
    var github_password = casper.cli.options.password;
    var rcloud_url = casper.cli.options.url;
    var functions = require(fs.absolute('basicfunctions'));
    var item = '"Mungaru-Male"';
    var name1 = [];
    var date = [];
    var name = [];
    var p = [];

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

    casper.then(function () {
        if (this.visible('#input-text-search')) {
            console.log('Search div is already opened');
        } else {
            this.click({type: 'xpath', path: ".//*[@id='accordion-left']/div[2]/div[1]/a/span"});
            console.log("Search div is not opened, Hence opening now");
        }
    });

    casper.then(function () {
        this.click({type: 'xpath', path: ".//*[@id='sort-by']"});//
        this.evaluate(function () {
            var form = document.querySelector('#sort-by');
            form.selectedIndex = 2;//selecting Name from drop down menu
            $(form).change();
        });
        console.log('selecting date from the sort by drop down menu');
        this.wait(2000);
        this.click('#order-by');//
        this.evaluate(function () {
            var form = document.querySelector('#order-by');
            form.selectedIndex = 1;//selecting descending from drop down menu
            $(form).change();
        });
        console.log('selecting descending from the order by drop down menu');
        this.wait(2000);
    });


    //entering item to be searched
    casper.then(function () {
        this.sendKeys('#input-text-search', item);
        console.log("Entering item to be searched");
        this.wait(6000);
        this.click('#search-form > div:nth-child(1) > div:nth-child(2) > button:nth-child(1)');
        console.log('clicking on search button');
    });

    casper.then(function () {
        for (var i = 0; i < 10; i++) {
            date[i] = this.fetchText({type: 'xpath', path: ".//*[@id='open_" + i + "']"});//fetching username along with notebook name
            var pos = date[i].lastIndexOf("/");//fetching only the notebook name from the above code
            name[i] = date[i].substring(pos + 1, date[i].length - 1);
        }
        //Verifying the fetched results with the searched results using reverse()
        name1 = name.reverse();
        this.test.assertEquals(name, name1, "Searched results are sorted according to 'Name' in 'descending' order");
    });
    
    casper.then(function(){
		for (var i=0; i<10; i++)
        {
           p[ i ] = this.fetchText(x(".//*[@id='open_" + i + "']"));
        }
        this.echo(p );
	});
    
    casper.run(function () {
        test.done();
    });
});
		
	
