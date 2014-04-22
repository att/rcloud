var casper;
var failure_id = 1;

exports.init = function(_casper) {
    casper = _casper;
};

////////////////////////////////////////////////////////////////////////////////
// actions

exports.sleep = function(delay) {
    return function() { return casper.wait(delay); };
};

exports.mouseover = function(selector) {
    return function() { return casper.mouseEvent('mouseover', selector); };
};

exports.mousemove = function(selector) {
    return function() { return casper.mouseEvent('mousemove', selector); };
};

exports.click = function(selector) {
    return function() { return casper.mouseEvent('click', selector); };
};

exports.render = function(target) {
    return function() { casper.page.render(target); };
};

function render_failure() {
    casper.page.render("failure" + failure_id + ".png");
    failure_id++;
}

////////////////////////////////////////////////////////////////////////////////
// testing

exports.fail = function(message) {
    return function() {
        casper.echo("TEST FAIL: " + message);
        render_failure();
    };
};

exports.pass = function(message) {
    return function() {
        if (message === void 0)
            casper.echo("Test passed.");
        else
            casper.echo("Test passed: " + message);
        return true;
    };
};

exports.pass_if = function(condition_function, fail) {
    return function() {
        if (condition_function()) {
            casper.echo("Test passed.");
        } else {
            casper.echo("TEST FAIL: " + fail);
            render_failure();
        }
        return true;
    };
};

exports.asserts_evals_truthy = function(eval_function, fail) {
    return function() {
        if (casper.evaluate(eval_function)) {
            casper.echo("Test passed.");
        } else {
            casper.echo("TEST FAIL: " + fail);
            render_failure();
        }
        return true;
    };
};

exports.asserts_eventually_evals_truthy = function(eval_function, fail) {
    return function() {
        return casper.waitFor(
            function() {
                return casper.evaluate(eval_function);
            }, function() {
                casper.echo("Test passed.");
                return true;
            }, function() {
                casper.echo("TEST FAIL: " + fail);
                render_failure();
            });
    };
};
