RCloud.UI.search = (function() {
    var page_size_ = 10;
    var search_err_msg = ["<p style=\"color:black;margin:0;\">The search engine in RCloud uses Lucene for advanced search features." ,
    "It appears you may have used one of the special characters in Lucene syntax incorrectly. " ,
    "Please see this <a target=\"_blank\" href=\"http://lucene.apache.org/core/7_1_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Terms\">link</a> to learn about Lucene syntax. " ,
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
    function all_sources() {
        return $("#all-sources").is(':checked');
    }
    
    function order_from_sort() {
        var orderby;
        switch(sortby()) {
            case 'starcount':
            case 'updated_at':
            case 'score':
            orderby = "desc";
            break;
            case 'user':
            case 'description':
            orderby = "asc";
            break;
        }
        $('#order-by').val(orderby);
    }

    function extract_error(msg) {
        if(/Bad Request/.test(msg))
            return 'Syntax error in query';
        else if(/Couldn't connect to server/.test(msg))
            return "Couldn't connect to notebook search server (solr)";
        else return "Unknown error (see browser log)";
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
                rcloud.get_gist_sources().then(function(sources) {
                    // annoying to load this over again just to get a number, but
                    // there's no obvious place to store this
                    if(_.isString(sources)) sources = [sources];
                    if(sources.length<2) {
                        $('#all-sources').parent().hide();
                    }
                    else {
                        $("#all-sources").change(function(e) {
                            var val = all_sources();
                            rcloud.config.set_user_option("search-all-sources", val);
                        });
                    }
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
            return rcloud.config.get_user_option(['search-all-sources', 'search-results-per-page',
            'search-sort-by', 'search-order-by'])
            .then(function(opts) {
                $('#all-sources').prop('checked', opts['search-all-sources']);
                if(opts['search-results-per-page']) page_size_ = opts['search-results-per-page'];
                if(!opts['search-sort-by']) opts['search-sort-by'] = 'score'; // always init once
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
            height += 40; // there is only so deep you can dig
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
                
                console.log(d);
                
                var i;
                var custom_msg = '';
                if(d === null || d === "null" || d.n_notebooks === "0") {
                    summary("No Results Found");
                } else if(d[0] === "error") {
                    d[1] = d[1].replace(/\n/g, "<br/>");
                    if($('#paging').html != "")
                        $('#paging').html("");
                    if(d[1].indexOf("org.apache.solr.search.SyntaxError")>-1)
                        custom_msg = search_err_msg.join("");
                    err_msg(custom_msg+"ERROR:\n" + d[1], 'darkred');
                } else {
                    
                    //iterating for all the notebooks got in the result/response
                    try {
                        numpaged = numfound = parseInt(d.n_notebooks);
                        var qtime = d.QTime;
                        var noofpages =  Math.ceil(numpaged/page_size_);
                        
                        var template = _.template(
                            $("#search_results_template").html()
                        );
                                                
                    } catch(e) {
                        summary("Error : \n" + e, 'darkred');
                    }
                    
                    if(!pgclick) {
                        $('#paging').html("");
                        $("#search-results-pagination").show();
                        if((parseInt(numpaged) - parseInt(page_size_)) > 0) {
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
                    } else if(parseInt(numpaged) < page_size_){
                        summary(numfound +" Results Found", 'darkgreen');
                    } else {
                        var search_summary = numfound +" Results Found, showing ";
                        // if (numSources > 1) { // for multi-sources it gets complicated, just show the page
                        //     search_summary += "page "+ Math.round(start/page_size_ + 1);
                        // } else {
                            if(numfound-start === 1) {
                                search_summary += (start+1);
                            } else if((numfound - noofrows) > 0) {
                                search_summary += (start+1)+" - "+noofrows;
                            } else {
                                search_summary += (start+1)+" - "+numfound;
                            }
                        //}
                        summary(search_summary, 'darkgreen');
                    }
                    $("#search-results-row").css('display', 'table-row');
                    $("#search-results-scroller").scrollTop(0);
                    $("#search-results").html(template({notebooks: d.notebooks}))
                    $("#search-results .search-result-heading").click(function(e) {
                        e.preventDefault();
                        var gistname = $(this).attr("data-gistname"), gistsource = $(this).attr("data-gistsource");
                        editor.open_notebook(gistname, null, gistsource, null, e.metaKey || e.ctrlKey);
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
                return rcloud.search(query, all_sources(), sortby, orderby, start, page_size_)
                .then(function(v) {
                    create_list_of_search_results(v);
                })
                .catch(function(error) {
                    console.log('search error', error);
                    summary(extract_error(error), 'darkred');
                });
            });
        }
    };
})();

