RCloud.UI.search = (function() {
var page_size_ = 10;
var search_err_msg = ["<p style=\"color:black;margin:0;\">The search engine in RCloud uses Lucene for advanced search features." ,
    "It appears you may have used one of the special characters in Lucene syntax incorrectly. " ,
    "Please see this <a target=\"_blank\" href=\"http://lucene.apache.org/core/3_5_0/queryparsersyntax.html\">link</a> to learn about Lucene syntax. " ,
    "</p><p style=\"color:black;margin:0;\">Or, if you mean to search for the character itself, escape it using a backslash, e.g. \"foo\\:\"</p>"];

function go_to_page(page_num,incr_by){
    //get the element number where to start the slice from
    var start = (parseInt(page_num) * parseInt(incr_by));
    var end = parseInt(start) + parseInt(incr_by);
    var qry = $('#input-text-search').val();
    var sortby= $("#sort-by option:selected").val();
    var orderby= $("#order-by option:selected" ).val();
    $('#input-text-search').blur();
    if(!($('#input-text-search').val() === ""))
        RCloud.UI.search.exec(qry,sortby,orderby,start,end,true);
}

function sortby() {
    return $("#sort-by option:selected").val();
}
function orderby() {
    return $("#order-by option:selected").val();
}

function order_from_sort() {
    var orderby;
    switch(sortby()) {
    case 'starcount':
    case 'updated_at':
        orderby = "desc";
        break;
    case 'user':
    case 'description':
        orderby = "asc";
        break;
    }
    $('#order-by').val(orderby);
}

return {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('search-snippet');
    },
    init: function() {
        if(!rcloud.search)
            $("#search-wrapper").text("Search engine not enabled on server");
        else {
            $("#search-form").submit(function(e) {
                searchproc();
                return false;
            });
            $("#sort-by").change(function() {
                rcloud.config.set_user_option('search-sort-by', sortby());
                order_from_sort();
                rcloud.config.set_user_option('search-order-by', orderby());
                searchproc();
            });
            $("#order-by").change(function() {
                rcloud.config.set_user_option('search-order-by', orderby());
                searchproc();
            });
            var searchproc=function() {
                var start = 0;
                var qry = $('#input-text-search').val();
                $('#input-text-search').focus();
                if (!($('#input-text-search').val() === "")) {
                    RCloud.UI.search.exec(qry, sortby(), orderby(), start, page_size_);
                } else {
                    $('#paging').html("");
                    $('#search-results').html("");
                    $('#search-summary').html("");
                }
            };
        };
    },
    load: function() {
        return rcloud.config.get_user_option(['search-results-per-page', 'search-sort-by', 'search-order-by'])
            .then(function(opts) {
                if(opts['search-results-per-page']) page_size_ = opts['search-results-per-page'];
                if(!opts['search-sort-by']) opts['search-sort-by'] = 'starcount'; // always init once
                $('#sort-by').val(opts['search-sort-by']);
                if(opts['search-order-by'])
                    $('#order-by').val(opts['search-order-by']);
                else
                    order_from_sort();
            });
    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#search-summary').height() + $('#search-results').height() + $('#search-results-pagination').height();
        height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    },
    toggle: function(id,togid) {
        $('#'+togid+'').text(function(_,txt) {
            var ret='';
            if ( txt.indexOf("Show me more...") > -1 ) {
                ret = 'Show me less...';
                $('#'+id+'').css('height',"auto");
            }else{
                ret = 'Show me more...';
                $('#'+id+'').css('height',"150px");
            }
            return ret;
        });
        return false;
    },

    exec: function(query, sortby, orderby, start, noofrows, pgclick) {
        function summary(html, color) {
            $('#search-summary').css('color', color || 'black');
            $("#search-summary").show().html($("<h4/>").append(html));
        }
        function err_msg(html, color) {
            $('#search-summary').css("display", "none");
            $('#search-results').css('color', color || 'black');
            $("#search-results-row").show().animate({ scrollTop: $(document).height() }, "slow");
            $("#search-results").show().html($("<h4/>").append(html));
        }
        function create_list_of_search_results(d) {
            var i;
            var custom_msg = '';
            if(d === null || d === "null" || d === "") {
                summary("No Results Found");
            } else if(d[0] === "error") {
                d[1] = d[1].replace(/\n/g, "<br/>");
                if($('#paging').html != "")
                    $('#paging').html("");
                if(d[1].indexOf("org.apache.solr.search.SyntaxError")>-1)
                    custom_msg = search_err_msg.join("");
                err_msg(custom_msg+"ERROR:\n" + d[1], 'darkred');
            } else {
                if(typeof (d) === "string") {
                    d = JSON.parse("[" + d + "]");
                }
                //convert any string type part to json object : not required most of the time
                for(i = 0; i < d.length; i++) {
                    if(typeof (d[i]) === "string") {
                        d[i] = JSON.parse(d[i]);
                    }
                }
                d.sort(function(a, b) {
                    var astars = +(a.starcount||0), bstars = +(b.starcount||0);
                    return bstars-astars;
                });
                var len = d.length;
                var search_results = "";
                var star_count;
                var qtime = 0;
                var numfound = 0;
                if(d[0] != undefined) {
                    numfound = d[0].numFound;
                }
                var noofpages =  Math.ceil(numfound/page_size_);
                //iterating for all the notebooks got in the result/response
                for(i = 0; i < len; i++) {
                    try {
                        qtime = d[0].QTime;
                        if(typeof d[i].starcount === "undefined") {
                            star_count = 0;
                        } else {
                            star_count = d[i].starcount;
                        }
                        var notebook_id = d[i].id;
                        var image_string = "<i class=\"icon-star search-star\"><sub>" + star_count + "</sub></i>";
                        d[i].parts = JSON.parse(d[i].parts);
                        var parts_table = "";
                        var inner_table = "";
                        var added_parts = 0;
                        //displaying only 5 parts of the notebook sorted based on relevancy from solr
                        var partslen = d[i].parts.length;
                        var nooflines =0;
                        for(var k = 0; k < d[i].parts.length && added_parts < 5; k++) {
                            inner_table = "";
                            var ks = Object.keys(d[i].parts[k]);
                            if(ks.length > 0 && d[i].parts[k].content !== "") {
                                var content = d[i].parts[k].content;
                                if(typeof content === "string")
                                    content = [content];
                                if(content.length > 0)
                                    parts_table += "<tr><th class='search-result-part-name'>" + d[i].parts[k].filename + "</th></tr>";
                                for(var l = 0; l < content.length; l++) {
                                    if (d[i].parts[k].filename === "comments") {
                                        var split = content[l].split(/ *::: */);
                                        if(split.length < 2)
                                            split = content[l].split(/ *: */); // old format had single colons
                                        var comment_content = split[1] || '';
                                        if(!comment_content)
                                            continue;
                                        var comment_author = split[2] || '';
                                        var display_comment = comment_author ? (comment_author + ': ' + comment_content) : comment_content;
                                        inner_table += "<tr><td class='search-result-comment'><span class='search-result-comment-content'>" + comment_author + ": " + comment_content + "</span></td></tr>";
                                    }
                                    else {
                                        inner_table += "<tr><td class='search-result-code'><code>" + content[l] + "</code></td></tr>";
                                    }
                                }

                                if (d[i].parts[k].filename != "comments") {
                                    nooflines += inner_table.match(/\|-\|/g).length;
                                }
                                added_parts++;
                            }
                            if(inner_table !== "") {
                                inner_table = inner_table.replace(/\|-\|,/g, '<br>').replace(/\|-\|/g, '<br>');
                                inner_table = inner_table.replace(/line_no/g,'|');
                                inner_table = "<table style='width: 100%'>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        var togid = i + "more";
                        var url = ui_utils.make_url('edit.html', {notebook: notebook_id});
                        if(parts_table !== "") {
                            if(nooflines > 10) {
                                parts_table = "<div><div style=\"height:150px;overflow: hidden;\" id='"+i+"'><table style='width: 100%'>" + parts_table + "</table></div>" +
                                    "<div style=\"position: relative;\"><a href=\"#\" id='"+togid+"' onclick=\"RCloud.UI.search.toggle("+i+",'"+togid+"');\" style=\"color:orange\">Show me more...</a></div></div>";
                            } else {
                                parts_table = "<div><div id='"+i+"'><table style='width: 100%'>" + parts_table + "</table></div></div>";
                            }
                        }
                        search_results += "<table class='search-result-item' width=100%><tr><td width=10%>" +
                            "<a id=\"open_" + i + "\" href=\'"+url+"'\" data-gistname='" + notebook_id + "' class='search-result-heading'>" +
                            d[i].user + " / " + d[i].notebook + "</a>" +
                            image_string + "<br/><span class='search-result-modified-date'>modified at <i>" + d[i].updated_at + "</i></span></td></tr>";
                        if(parts_table !== "")
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12'><div>" + parts_table + "</div></td></tr>";
                        search_results += "</table>";
                    } catch(e) {
                        summary("Error : \n" + e, 'darkred');
                    }
                }
                if(!pgclick) {
                    $('#paging').html("");
                    $("#search-results-pagination").show();
                    if((parseInt(numfound) - parseInt(page_size_)) > 0) {
                        var number_of_pages = noofpages;
                        $('#current_page').val(0);
                        if (numfound != 0) {
                            var current_link = 0;
                            $("#paging").bootpag({
                                total: number_of_pages,
                                page: 1,
                                maxVisible: 8
                            }).on('page', function (event, num) {
                                go_to_page(num - 1, page_size_);
                            });
                        }
                    }
                }

                var qry = decodeURIComponent(query);
                qry = qry.replace(/</g,'&lt;');
                qry = qry.replace(/>/g,'&gt;');
                if(numfound === 0) {
                    summary("No Results Found");
                } else if(parseInt(numfound) < page_size_){
                    summary(numfound +" Results Found", 'darkgreen');
                } else {
                    var search_summary = numfound +" Results Found, showing ";
                    if(numfound-start === 1) {
                        search_summary += (start+1);
                    } else if((numfound - noofrows) > 0) {
                        search_summary += (start+1)+" - "+noofrows;
                    } else {
                        search_summary += (start+1)+" - "+numfound;
                    }
                    summary(search_summary, 'darkgreen');
                }
                $("#search-results-row").css('display', 'table-row');
                $("#search-results-scroller").scrollTop(0);
                $('#search-results').html(search_results);
                $("#search-results .search-result-heading").click(function(e) {
                    e.preventDefault();
                    var gistname = $(this).attr("data-gistname");
                    editor.open_notebook(gistname, null, null, e.metaKey || e.ctrlKey);
                    return false;
                });
            }
            $("#collapse-search").trigger("size-changed");
        }

        summary("Searching...");
        if(!pgclick) {
            $("#search-results-row").hide();
            $("#search-results").html("");
        }
        query = encodeURIComponent(query);
        RCloud.UI.with_progress(function() {
            return rcloud.search(query, sortby, orderby, start, page_size_)
                .then(function(v) {
                    create_list_of_search_results(v);
                });
        });
    }
};
})();

