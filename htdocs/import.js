function port_init() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {
                $('#output').append($('<p/>').append(hello));
            });
        }
    });
}

function do_import() {
    var url = document.getElementById('source').value,
        notebooks = document.getElementById('notebooks').value;
    notebooks = _.without(notebooks.split(/[\s,;]+/), "");
    rcloud.port_notebooks(url, notebooks,
                          function(result) {
                              $('#output').append($('<p/>').append(JSON.stringify(result)));
                          });
}

window.onload = port_init;
