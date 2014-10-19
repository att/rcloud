RCloud.UI.search = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('search-snippet');
    },
    init: function() {
        if(!rcloud.search)
            $("#search-wrapper").text("Search engine not enabled on server");
        else {
            $("#search-form").submit(function(e) {
                e.preventDefault();
                e.stopPropagation();
                var qry = $('#input-text-search').val();
                $('#input-text-search').focus();
                RCloud.UI.search.exec(qry);
                return false;
            });
        }
    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#search-summary').height() + $('#search-results').height();
        height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    },
    exec: function(query) {
        function summary(html) {
            $("#search-summary").show().html($("<h4 />").append(html));
        }
        function create_list_of_search_results(d) {
            var i;
            if(d === null || d === "null" || d === "") {
                summary("No Results Found");
            } else if(d[0] === "error") {
                d[1] = d[1].replace(/\n/g, "<br/>");
                summary("ERROR:\n" + d[1]);
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
                var match_count = 0;
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
                        var image_string = "<i class=\"icon-star\" style=\"font-size: 110%; line-height: 90%;\"><sub>" + star_count + "</sub></i>";
                        d[i].parts = JSON.parse(d[i].parts);
                        var parts_table = "";
                        var inner_table = "";
                        var added_parts = 0;
                        //displaying only 5 parts of the notebook sorted based on relevancy from solr
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
                                        var comment_content = content[l].substr(content[l].indexOf(":")+1, content[l].lastIndexOf(":")-content[l].indexOf(":")-1);
                                        var comment_author = content[l].substr(content[l].lastIndexOf(":")+1, content[l].length-content[l].lastIndexOf(":")-1);
                                        inner_table += "<tr><td width='auto'><b>" + comment_author + "</b>&nbsp;&nbsp;</td><td class='search-result-code'><i>" + comment_content + "</i></td></tr>";
                                    }
                                    else {
                                        inner_table += "<tr><td class='search-result-line-number'>" + (l + 1) + "</td><td class='search-result-code'><code>" + content[l] + "</code></td></tr>";
                                    }
                                }
                                added_parts++;
                            }
                            if(inner_table !== "") {
                                inner_table = "<table>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        if(parts_table !== "") {
                            parts_table = "<table>" + parts_table + "</table>";
                        }
                        search_results += "<table class='search-result-item' width=100%><tr><td width=10%>" +
                            "<a id=\"open_" + i + "\" href='#' data-gistname='" + notebook_id + "' class='search-result-heading'>" +
                            d[i].user + " / " + d[i].notebook + "</a>" +
                            image_string + "<br/><span class='search-result-modified-date'>modified at <i>" + d[i].updated_at + "</i></span></td></tr>";
                        if(parts_table !== "") {
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12'><div>" + parts_table + "</div></td></tr>";
                            match_count = match_count + 1
                        }
                        search_results += "</table>";
                    } catch(e) {
                        summary("Error : \n" + e);
                    }
                }
                var qry = decodeURIComponent(query);
                qry = qry.replace(/</g,'&lt;');
                qry = qry.replace(/>/g,'&gt;');
                var search_summary = match_count + " Results Found"; //+ " <i style=\"font-size:10px\"> Response Time:"+qtime+"ms</i>";
                summary(search_summary);
                $("#search-results-row").css('display', 'table-row');
                $('#search-results').html(search_results);
                $("#search-results .search-result-heading").click(function(e) {
                    e.preventDefault();
                    var gistname = $(this).attr("data-gistname");
                    editor.open_notebook(gistname, null, null, true, e.metaKey || e.ctrlKey);
                    return false;
                });
            }
            $("#collapse-search").trigger("size-changed");
        }

        summary("Searching...");
        $("#search-results-row").hide();
        $("#search-results").html("");
        query = encodeURIComponent(query);
        RCloud.UI.with_progress(function() {
            return rcloud.search(query)
                .then(function(v) {
                    create_list_of_search_results(v);
                });
        });
    }
};
