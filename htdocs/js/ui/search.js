RCloud.UI.search = {
    exec: function(query) {
        var res;
        $('#divClose').css('width', $(document).width() - 45);
        $('#divPopup').css('width', $(document).width() - 45);

        function create_list_of_search_results(d) {
            var i;
            if(d == null || d == "null" || d == "") {
                alert("No Results Found");
            } else if(d[0] == "error") {
                d[1] = d[1].replace(/\n/g, "<br/>");
                alert("ERROR:\n" + d[1]);
            } else {
                if(typeof (d) == "string") {
                    d = JSON.parse("[" + d + "]");
                }
                //convertin any string type part to json object : not required most of the time
                for(i = 0; i < d.length; i++) {
                    if(typeof (d[i]) == "string") {
                        d[i] = JSON.parse(d[i]);
                    }
                }
                var len = d.length;
                var search_results = "";
                var star_count;
                var qtime = 0;
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
                        var image_string = "<i class=\"icon-star\" style=\"font-size: 100%; line-height: 90%;\"></i><sub>" + star_count + "</sub>";
                        d[i].parts = JSON.parse(d[i].parts);
                        var parts_table = "";
                        var inner_table = "";
                        var added_parts = 0;
                        //displaying only 5 parts of the notebook sorted based on relevancy from solr
                        for(var k = 0; k < d[i].parts.length && added_parts < 5; k++) {
                            inner_table = "";
                            var ks = Object.keys(d[i].parts[k]);
                            if(ks.length > 0 && d[i].parts[k].content != "") {
                                if(typeof (d[i].parts[k].content) == "string") {
                                    parts_table += "<tr><th style=\"font-size:11px\">" + d[i].parts[k].filename + "</th></tr>";
                                    inner_table += "<tr><td style=\"width:10px;border-right:solid 1px gray\">" + 1 + "</td><td><code>" + d[i].parts[k].content + "</code></td></tr>";
                                    added_parts++;
                                } else {
                                    if(d[i].parts[k].content.length > 0) {
                                        parts_table += "<tr><th style=\"font-size:11px\">" + d[i].parts[k].filename + "</th></tr>";
                                    }
                                    for(var l = 0; l < d[i].parts[k].content.length; l++) {
                                        inner_table += "<tr><td style=\"width:10px;border-right:solid 1px gray;\">" + (l + 1) + "</td><td><code>" + d[i].parts[k].content[l] + "</code></td></tr>";
                                    }
                                    added_parts++;
                                }
                            }
                            if(inner_table != "") {
                                inner_table = "<table>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        if(parts_table != "") {
                            parts_table = "<table style=\"boder:solid 2px gray;\">" + parts_table + "</table>";
                        }
                        search_results += "<table id=\"notebooks_table\" width=100%><tr><td width=10%><i class=\"icon-play\"></i>" + "<label href='#' id=\"open_" + i + "\" onclick='editor.load_notebook(\"" + notebook_id + "\")' style='color:blue; margin-right: 5px; cursor: pointer; padding-left: 10px'>" + d[i].user + " / " + d[i].notebook + "</label>" + image_string + "<br/>modified_at <i>" + d[i]["updated_at"] + "</i></td></tr>";
                        if(parts_table != "")
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12;border:solid 1px #c0c0c0'><div style=\"border:solid 3px #b0b0b0;margin:1px;padding:4px;margin-left:4px;\">" + parts_table + "</div></td></tr>";
                        search_results += "</table><hr/>";
                    } catch(e) {
                        alert("Error : \n" + e);
                    }
                }
                var qry = decodeURIComponent(query);
                qry = qry.replace(/\</g,'&lt;');
                qry = qry.replace(/\>/g,'&gt;');
                var search_summary = "<h4>Search For: <b>" +qry+"</b> <i style=\"font-size:10px\">Results Found:"+len+"</i><i style=\"font-size:10px\"> Response Time:"+qtime+"ms</i></h4>\n";
                $("#search-summary").show().html(search_summary);
                $("#search-results").show().css("height", "50vh").html(search_results);
            }
        };
        query = encodeURIComponent(query);
        rcloud.with_progress(function(done) {
            rcloud.search(query).then(function (v) {
                create_list_of_search_results(v);
                done();
            });
        });
    }
};
