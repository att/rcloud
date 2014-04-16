(function() {

var progress_dialog;
var progress_counter = 0;
var allowed = 1;
var curtains_on = false;

function set_curtain() {
    if (curtains_on)
        return;
    curtains_on = true;
    if (_.isUndefined(progress_dialog)) {
        progress_dialog = $('<div id="progress-dialog" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">Please wait...</div></div></div>');
        $("body").append(progress_dialog);
    }
    progress_dialog.modal({keyboard: true});
}

function clear_curtain() {
    if (!curtains_on)
        return;
    curtains_on = false;
    progress_dialog.modal('hide');
}

function set_cursor() {
    _.delay(function() {
        document.body.style.cursor = "wait";
    }, 0);
}

function clear_cursor() {
    _.delay(function() {
        document.body.style.cursor = '';
    }, 0);
}

RCloud.UI.with_progress = function(promise_thunk, delay) {
    if (_.isUndefined(delay))
        delay = 2000;
    set_cursor();
    function done() {
        progress_counter -= 1;
        if (progress_counter === 0) {
            clear_cursor();
            clear_curtain();
        }
    }
    _.delay(function() {
        if (progress_counter > 0 && allowed > 0)
            set_curtain();
    }, delay);
    progress_counter += 1;
    return Promise.resolve(done)
        .then(promise_thunk)
        .then(function(v) {
            done();
            return v;
        }).catch(function(error) {
            done();
            throw error;
        });
};

RCloud.UI.prevent_progress_modal = function() {
    if (allowed === 1) {
        if (progress_counter > 0) {
            clear_cursor();
            clear_curtain();
        }
    }
    allowed -= 1;
};

RCloud.UI.allow_progress_modal = function() {
    if (allowed === 0) {
        if (progress_counter > 0) {
            set_cursor();
            set_curtain();
        }
    }
    allowed += 1;
};

})();
