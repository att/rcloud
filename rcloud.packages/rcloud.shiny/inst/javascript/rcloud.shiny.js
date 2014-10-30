((function() {

// FIXME: since shiny HTML generation injects shiny.js
//        directly we can't use require for this (AFAICT) [SU]
requirejs.config({
    paths: {
        "shiny": "../../shared.R/shiny"
    }
});

var sockets_ = [];
var ocaps_ = null;

function fakeWebSocket() {
    var fws = {
        readyState: false,
        send: function(msg) {
            console.log("client to Shiny: ", arguments);
            ocaps_.sendAsync(id, msg).then(function(response) {
                console.log("Shiny response: ", response);
            });
        }
    };
    var id = sockets_.length;
    sockets_.push(fws);
    fws.id = id;
    ocaps_.connectAsync(id).then(function() {
        fws.readyState = true;
        fws.onopen();
    });
    return fws;
}

function rcloud_uploadFiles(evt) {
    var id = evt.target.id;
     var file_opts = {
                upload_ocaps: window.upload_ocaps,
                force:true,
                $file:$('#'+id),
                $upload_results: $('#file-upload-results')
              };
    RCloud.UI.upload_with_alerts(false, file_opts).then(function(){alert('File uploaded');});
}

return {
    init: function(ocaps, k) {
        ocaps_ = RCloud.promisify_paths(ocaps, [["connect"], ["send"]]);
        window.Shiny = {
            createSocket: function() {
                return fakeWebSocket();
            }
        };
        k();
    },

    setup_upload_ocaps: function(ocaps, k) {
        var paths = [["upload_path"],
            ["create"],
            ["write"],
            ["close"]];
        window.upload_ocaps = RCloud.promisify_paths(ocaps, paths);

        setTimeout(function() {
			var fileObjects = $(document).find('input[type="file"]') || [];
			for (var j = 0; j < fileObjects.length; j++) {
				$(fileObjects[j]).off('change.fileInputBinding').on('change.fileInputBinding', rcloud_uploadFiles);
			}
        }, 1000);

        k();
        return;
    },

    on_message: function(id, msg, k) {
        console.log("Shiny to client: ", msg);
        sockets_[0].onmessage({data:msg});
        k();
    }
};
})()) /*jshint -W033 */ // this is an expression not a statement
