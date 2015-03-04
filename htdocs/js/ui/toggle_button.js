RCloud.UI.toggle_button = (function() {
    var toggle_button_ = $("#toggle-view"),
        external_link_ = $('#external-link'),
        iframe_ = $('#iframe'),
        output_ = $('#output'),
        end_of_output_ = $('#end-of-output');

    function display(icon, title) {
        $('i', toggle_button_).removeClass().addClass(icon);
        toggle_button_.attr('title', title);
    }
    function highlight(whether) {
        toggle_button_.parent().find('.button-highlight').animate({opacity: whether ? 1 : 0}, 250);
    }
    function createIndex() {
        var found = shell.notebook.model.get_asset('index.html');

        var indexTemplate = 

"<html>\n\
<head>\n\
<script>\n\
start = function() {\n\
    fiddle.call_notebook('"+shell.gistname()+"')\n\
    .then(function(x) {\n\
        $('body').append('<BR>'+x.string);\n\
        console.log(x);\n\
    })\n\
    .catch(function(err) {\n\
        console.error(err);\n\
    });\n\
}\n\
</script>\n\
</head>\n\
<body>\n\
\n\
<!--\n\
To pass data from R to Javascript, include the following lines:\n\
library(rcloud.web)\n\
mystring <- 'My test string'\n\
myvec <- c(1:10)\n\
mydf <- mtcars\n\
rcw.result(string = mystring, vec = myvec, df = mydf)\n\
-->\n\
\n\
Hello World!\n\
<script src='/lib/js/require-common.js'></script>\n\
<script src='/lib/js/require.js' data-main='/lib/js/require-fiddle-output.js'></script>\n\
</body>\n\
</html>";

        if(found) {
            found.controller.select();
        }
        else {
            shell.notebook.controller
                .append_asset(indexTemplate, 'index.html')
                .spread(function(_, controller) {
                    controller.select();
                    ui_utils.ace_set_pos(RCloud.UI.scratchpad.widget, 2, 1);
                });
        }
    }

    function toggleHTML5() {
        toggle_button_.click(function () {});
        createIndex();
        $('#new-tab a').attr('href',window.location.origin+'/notebook.R/'+shell.gistname()+'/index.html');

        output_.hide();
        end_of_output_.hide();
        $('#prompt-area').hide();
        iframe_.show();
        $('#new-tab').show();
        display('icon-code','Toggle Notebook');
        toggle_button_.click(toggleCode);
        highlight(false);
    }

    function toggleCode() {
        toggle_button_.click(function () {});
        iframe_.hide();
        $('#new-tab').hide();
        output_.show();
        end_of_output_.show();
        $('#prompt-area').show();
        display('icon-html5','Toggle Web View');
        toggle_button_.click(toggleHTML5);
        highlight(false);
    }

    return {
        init: function() {
            toggleCode();
        }
    };
})();
