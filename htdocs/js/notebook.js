Notebook = {};

Notebook.new_cell = function(content, type)
{
    var sent_command_div = $('<pre class="r-sent-command"></pre>').html('> ' + content);
    var wrapper_div = $("<div></div>");
    wrapper_div.append(sent_command_div);
    
    if (type === 'markdown') {
        var wrapped_command = rclient.markdown_wrap_command(content);
        rclient.send_and_callback(wrapped_command[0], function(r) {
            console.log(r.value[1].value[0]);
            var result_div = wrapper_div.append(
                $("<div></div>")
                    .html(r.value[1].value[0]))
                    .find("pre code")
                    .each(function(i, e) {
                        hljs.highlightBlock(e);
                    });
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            // wrapper_div.append(
        });
    } else
        alert("Can only do markdown for now!");

    return {
        div: function() {
            return wrapper_div;
        }
    };
};
