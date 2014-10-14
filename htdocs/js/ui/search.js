RCloud.UI.search = {
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
                searchproc();
            });
            $("#order-by").change(function() {
                searchproc();
            });
            var searchproc=function() {
                var start = 1;
                var noofrows = 5;
                var qry = $('#input-text-search').val();
                var sortby = $("#sort-by option:selected").val();
                var orderby = $("#order-by option:selected").val();
                $('#input-text-search').focus();
                if (!($('#input-text-search').val() === "")) {
                    RCloud.UI.search.exec(qry, sortby, orderby, start, noofrows);
                } else {
                    $('#paging').html("");
                    $('#search-results').html("");
                    $('#search-summary').html("");
                }
            }
        }
    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#search-summary').height() + $('#search-results').height();
        height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    },
    exec: function(query,sortby,orderby,start,noofrows,pgclick) {
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
                var numfound = 0;
                var show_per_page = 0;

                if(d[0] != undefined) {
                    numfound = d[0].numFound;
                    show_per_page = d[0].pagesize;
                }
                var noofpages =  Math.ceil(numfound/show_per_page);
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
                        var partslen = d[i].parts.length;
                        var nooflines =0;
                        for(var k = 0; k < d[i].parts.length && added_parts < 5; k++) {
                            inner_table = "";
                            var ks = Object.keys(d[i].parts[k]);
                            if(ks.length > 0 && d[i].parts[k].content !== "" && d[i].parts[k].filename != "scratch.R") {
                                var content = d[i].parts[k].content;
                                if(typeof content === "string")
                                    content = [content];
                                if(content.length > 0)
                                    parts_table += "<tr><th class='search-result-part-name'>" + d[i].parts[k].filename + "</th></tr>";
                                for(var l = 0; l < content.length; l++) {
                                    inner_table += "<tr><td class='search-result-code'><code>" + content[l] + "</code></td></tr>";
                                }
                                if (d[i].parts[k].filename != "comments") {
                                    nooflines += inner_table.match(/\|-\|/g).length;
                                }
                                added_parts++;
                            }
                            if(inner_table !== "") {
                                inner_table = inner_table.replace(/\|-\|,/g, '<br>').replace(/\|-\|/g, '<br>');
                                inner_table = inner_table.replace(/line_no/g,'|');
                                inner_table = "<table>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        var togid = i + "more";
                        if(parts_table !== "") {
                            if(nooflines > 10) {
                                parts_table = "<div><div style=\"height:150px;overflow: hidden;\" id='"+i+"'><table>" + parts_table + "</table></div>" +
                                    "<div style=\"position: relative;\"><a href=\"#\" id='"+togid+"' onclick=\"toggle("+i+",'"+togid+"');\" style=\"color:orange\">Show me more...</a></div></div>";
                            } else {
                                parts_table = "<div><div id='"+i+"'><table>" + parts_table + "</table></div></div>";
                            }
                        }
                        search_results += "<table class='search-result-item' width=100%><tr><td width=10%>" +
                            "<a id=\"open_" + i + "\" href='#' data-gistname='" + notebook_id + "' class='search-result-heading'>" +
                            d[i].user + " / " + d[i].notebook + "</a>" +
                            image_string + "<br/><span class='search-result-modified-date'>modified at <i>" + d[i].updated_at + "</i></span></td></tr>";
                        if(parts_table !== "")
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12'><div>" + parts_table + "</div></td></tr>";
                        search_results += "</table>";
                    } catch(e) {
                        summary("Error : \n" + e);
                    }
                }
                if(!pgclick) {
                    $('#paging').html("");
                    var number_of_pages = noofpages;
                    $('#current_page').val(0);
                    $('#show_per_page').val(show_per_page);
                    if(numfound != 0) {
                        var current_link = 0;
                        $("#paging").bootpag({
                            total: number_of_pages,
                            page: 1,
                            maxVisible: 8
                        }).on('page', function(event, num){
                            go_to_page(num-1);
                        });
                    }
                }

                var qry = decodeURIComponent(query);
                qry = qry.replace(/</g,'&lt;');
                qry = qry.replace(/>/g,'&gt;');
                var search_summary;
                if(numfound === 0) {
                    var search_summary = "No Results Found";
                } else {
                    search_summary = numfound +" Results Found, showing ";
                    if(numfound-start === 1) {
                        search_summary += (start + 1);
                    } else if(numfound-start != 1 && numfound < noofrows) {
                        search_summary += (start+1)+" - "+numfound;
                    } else if(start === 1 ) {
                        search_summary += start+" - "+noofrows;
                    } else {
                        search_summary += (start+1)+" - "+noofrows;
                    }
                }
                summary(search_summary);
                $("#search-results-row").css('display', 'table-row');
                $("#search-results-row").animate({ scrollTop: $(document).height() }, "slow");
                $('#search-results').html(search_results);
                $('.next,.prev').removeClass('disabled');
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
            return rcloud.search(query,sortby,orderby,start,noofrows)
                .then(function(v) {
                    create_list_of_search_results(v);
                });
        });
    }
};

function toggle(id,togid) {
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
}
function go_to_page(page_num){
    //get the number of items shown per page
    var show_per_page = parseInt($('#show_per_page').val());
    //get the element number where to start the slice from
    var start = (page_num * 5);
    var end = start + 5;
    var qry = $('#input-text-search').val();
    var sortby= $("#sort-by option:selected").val();
    var orderby= $("#order-by option:selected" ).val();
    $('#input-text-search').blur();
    $('.next,.prev').addClass('disabled');
    if(!($('#input-text-search').val() === ""))
        RCloud.UI.search.exec(qry,sortby,orderby,start,end,true);
}
//JQuery bootpage library
//http://botmonster.com/jquery-bootpag/#.VCo9k61DsYV
(function($) {

    $.fn.bootpag = function(options){

        var $owner = this,
            settings = $.extend({
                    total: 0,
                    page: 1,
                    maxVisible: null,
                    leaps: true,
                    href: 'javascript:void(0);',
                    hrefVariable: '{{number}}',
                    next: '&raquo;',
                    prev: '&laquo;'
                },
                    $owner.data('settings') || {},
                    options || {});

        if(settings.total <= 0)
            return this;

        if(!$.isNumeric(settings.maxVisible) && !settings.maxVisible){
            settings.maxVisible = settings.total;
        }

        $owner.data('settings', settings);

        function renderPage($bootpag, page){

            var lp,
                maxV = settings.maxVisible == 0 ? 1 : settings.maxVisible,
                step = settings.maxVisible == 1 ? 0 : 1,
                vis = Math.floor((page - 1) / maxV) * maxV,
                $page = $bootpag.find('li');
            settings.page = page = page < 0 ? 0 : page > settings.total ? settings.total : page;
            $page.removeClass('disabled');
            lp = page - 1 < 1 ? 1 :
                    settings.leaps && page - 1 >= settings.maxVisible ?
                Math.floor((page - 1) / maxV) * maxV : page - 1;
            $page
                .first()
                .toggleClass('disabled', page === 1)
                .attr('data-lp', lp)
                .find('a').attr('href', href(lp));

            var step = settings.maxVisible == 1 ? 0 : 1;

            lp = page + 1 > settings.total ? settings.total :
                    settings.leaps && page + 1 < settings.total - settings.maxVisible ?
                vis + settings.maxVisible + step: page + 1;

            $page
                .last()
                .toggleClass('disabled', page === settings.total)
                .attr('data-lp', lp)
                .find('a').attr('href', href(lp));;

            var $currPage = $page.filter('[data-lp='+page+']');
            if(!$currPage.not('.next,.prev').length){
                var d = page <= vis ? -settings.maxVisible : 0;
                $page.not('.next,.prev').each(function(index){
                    lp = index + 1 + vis + d;
                    $(this)
                        .attr('data-lp', lp)
                        .toggle(lp <= settings.total)
                        .find('a').html(lp).attr('href', href(lp));
                });
                $currPage = $page.filter('[data-lp='+page+']');
            }
            $currPage.addClass('disabled');
            $owner.data('settings', settings);
        }

        function href(c){

            return settings.href.replace(settings.hrefVariable, c);
        }

        return this.each(function(){

            var $bootpag, lp, me = $(this),
                p = ['<ul class="pagination pagination-sm bootpag">'];

            if(settings.prev){
                p.push('<li data-lp="1" class="prev"><a href="'+href(1)+'">'+settings.prev+'</a></li>');
            }
            for(var c = 1; c <= Math.min(settings.total, settings.maxVisible); c++){
                p.push('<li data-lp="'+c+'"><a href="'+href(c)+'">'+c+'</a></li>');
            }
            if(settings.next){
                lp = settings.leaps && settings.total > settings.maxVisible
                    ? Math.min(settings.maxVisible + 1, settings.total) : 2;
                p.push('<li data-lp="'+lp+'" class="next"><a href="'+href(lp)+'">'+settings.next+'</a></li>');
            }
            p.push('</ul>');
            me.find('ul.bootpag').remove();
            me.append(p.join(''));
            $bootpag = me.find('ul.bootpag');
            me.find('li').click(function paginationClick(){

                var me = $(this);
                if(me.hasClass('disabled')){
                    return;
                }
                var page = parseInt(me.attr('data-lp'), 10);
                renderPage($bootpag, page);
                $owner.trigger('page', page);
            });
            renderPage($bootpag, settings.page);
        });
    }

})($);