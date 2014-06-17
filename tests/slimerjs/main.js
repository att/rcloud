// FIXME this test suite only works for cscheid for now. This is bad.
// But how do we solve this in general?
////////////////////////////////////////////////////////////////////////////////


var casper = require('casper').create();
var fs = require('fs');
var login = require(fs.absolute('login'));
var utils = require(fs.absolute('utils'));
utils.init(casper);

casper.echo("This test suite will print 'Failed to load image information -'");
casper.echo("throughout its execution. Please ignore that.\n");

login.login(casper)
    .thenOpen("http://127.0.0.1:8080/edit.html?notebook=6aebcdb2c2e174b98454")
    .then(utils.sleep(3000))
    .then(utils.asserts_evals_truthy(function() {
        return $("#session-info").children().length === 0;
    }, "edit.html simple load"));

////////////////////////////////////////////////////////////////////////////////
// test that a simple notebook can be viewed
// https://github.com/att/rcloud/issues/575

casper.thenOpen("http://127.0.0.1:8080/view.html?notebook=6aebcdb2c2e174b98454")
    .then(utils.asserts_eventually_evals_truthy(function() {
        return $('pre:contains("579")').length > 0;
    }, "view.html simple show"));

////////////////////////////////////////////////////////////////////////////////
// test that "coalesce cells" tooltips are removed
// https://github.com/att/rcloud/issues/576

// first, we revert the version so that we get something editable
// and, in the process, we test that we can actually revert things.

/*

 For some reason mouseover and mousemove are not enough to trigger
 the bootstrap tooltip...

casper.thenOpen("http://127.0.0.1:8080/edit.html?notebook=766ba6e2baee4435bd9e&version=346993bff128b211248b58fe421f9ebadc9425da")
    .then(utils.sleep(5000))
    .then(utils.asserts_evals_truthy(function() {
        return $("#fork-revert-notebook").text() === "Revert";
    }, "Loading old version should show revert button"))
    .then(utils.click("#fork-revert-notebook"))
    .then(utils.sleep(2000))
    .then(utils.asserts_evals_truthy(function() {
        return $("#fork-revert-notebook").css("display") === "none";
    }, "Reverting should hide revert button"))
    .then(utils.mousemove(".notebook-cell:nth-child(3) .icon-link"))
    .then(utils.mouseover(".notebook-cell:nth-child(3) .icon-link"))
    .then(utils.sleep(5000))
    .then(utils.click(".notebook-cell:nth-child(3) .icon-link"))
    .then(utils.sleep(5000))
    .then(utils.asserts_evals_truthy(function() {
        return $(".tooltip").length === 0;
    }, "Coalescing cells should not leave tooltips behind"));
;
*/

casper.run();
