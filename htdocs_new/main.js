/*
 * 1910 : added these functions for supporting search functionality [ Line : 5 TO 89]
 * */
 
function getCleanedJsonResponse(res){
	var res =res.split("<pre><code>##");
	res=res[1].replace("</code></pre>","");  
	res = res.replace(/&quot;/g, "\"");
	//res=res.replace(/\[.*\]/g,"");
	res=res.replace(/\n/g,"");
	res=res.replace(/\[1\]/g,"");
	//res=res.replace(/\\/g,"");
	res = JSON.parse(JSON.parse(res));
	return res;
}

function showResult(v){
	$("#search-popup-body").html(getCleanedJsonResponse(v));
	$("#search-popup").show();
}

function search_nodejs(){
	var u = 'http://127.0.0.1:9090';
	var qry = $('#input-text-search').val();
	if(qry==""){
		alert("please enter search term");
		return;
	}
	qry = qry.replace("/user","/attr_user");
	var arr = qry.split('/');
	if(arr.length <2){
		qry+="//";
	}else if(arr.length <3){
		qry+="/";
	}
	$.ajax({
	 url:u+"/"+qry,
	 type:"GET",
	 crossDomain: true,
	 dataType: 'json',
	 success:function(json_obj){
		json_obj = JSON.parse(json_obj);
		fomatedData = createGoogleForm(json_obj,arr[0]);
		$("#search-popup-body").html(fomatedData);
		$("#search-popup-head-title").html("Search Result : <b style='font-size:14px'>"+json_obj.response.numFound+" results found</b>");
		$("#search-popup").show();
	 },
	 error:function(e){
	 },
	});	
}

function search(){	
	var qry = $('#input-text-search').val();
	rcloud.custom_search(qry); 
	return;
}

function createListOfSearchReasults(d,q){
	var len = d.response.docs.length;
	var tableContent=""; 
	for(var i=0;i<len;i++){
		d.response.docs[i].url = d.response.docs[i].url.substring(0,(d.response.docs[i].url.length-4));
		d.response.docs[i].content = (d.response.docs[i].content+"").replace(/q/g,'<b style="color:red;background:yellow">'+q+'</b>');
		var notebook_id = d.response.docs[i].id;
		tableContent += "<table width=100%><tr><td onclick='loadSearchedNotebook(\""+notebook_id+"\")'><label style='color:blue'>https://api.github.com/gists/"+d.response.docs[i].id+"</label>["+d.response.docs[i].user+"]</td></tr></table><br/>";
	}
	return tableContent;
}

function createGoogleForm(json_obj,q){
	var len = json_obj.response.docs.length;
	var tableContent=""; 
	for(var i=0;i<len;i++){
		json_obj.response.docs[i].url = json_obj.response.docs[i].url.substring(0,(json_obj.response.docs[i].url.length-4));
		json_obj.response.docs[i].content = (json_obj.response.docs[i].content+"").replace(/q/g,'<b style="color:red;background:yellow">'+q+'</b>');
		var notebook_id = (json_obj.response.docs[i].url).split("/")[(json_obj.response.docs[i].url).split("/").length-1];
		tableContent += "<table width=100%><tr><td><label style='font-size:14px;color:blue' onclick='loadSearchedNotebook(\""+notebook_id+"\")'>"+json_obj.response.docs[i].url+"</label></td></tr><tr><td>"+json_obj.response.docs[i].content+"</td></tr></table><br/>";
	}
	return tableContent;
}

function loadSearchedNotebook(notebook_id){
	console.log("loading : "+notebook_id);
	if(notebook_id != null){
		shell.open_from_github(notebook_id);	
    }	
}
/*--------------------------END--------------------------*/

function resize_side_panel() {
    var non_notebook_panel_height = 246;
    $('.notebook-tree').css('height', (window.innerHeight - non_notebook_panel_height)+'px');
}

function init_fork_revert_button() {
    $("#fork-revert-notebook").click(function() {
        shell.fork_or_revert_button();
    });
}

function init_github_buttons() {
    $("#open-in-github").click(function() {
        shell.open_in_github();
    });
    $("#open-from-github").click(function() {
        var result = prompt("Enter notebook ID or github URL:");
        if(result !== null)
            shell.open_from_github(result);
    });
    $("#import-notebooks").click(function() {
        shell.import_notebooks();
    });
}

function init_upload_pane() {
    $("#upload-submit").click(function() {
        var to_notebook = ($('#upload-to-notebook').is(':checked'));
        var success = function(path, file, notebook) {
            $("#file-upload-div").append(
                bootstrap_utils.alert({
                    "class": 'alert-info',
                    text: (to_notebook ? "Asset " : "File ") + file.name + " uploaded."
                })
            );
            if(to_notebook)
                editor.update_notebook_file_list(notebook.files);
        };
        var upload_function = to_notebook
            ? rcloud.upload_to_notebook
            : rcloud.upload_file;

        upload_function(false, success, function() {
            var overwrite_click = function() {
                rcloud.upload_file(true, success, function(exception_value) {
                    var msg = exception_value;
                    $("#file-upload-div").append(
                        bootstrap_utils.alert({
                            "class": 'alert-danger',
                            text: msg
                        })
                    );
                });
            };
            var alert_element = $("<div></div>");
            var p = $("<p>File exists. </p>");
            alert_element.append(p);
            var overwrite = bootstrap_utils
                .button({"class": 'btn-danger'})
                .click(overwrite_click)
                .text("Overwrite");
            p.append(overwrite);
            $("#file-upload-div").append(bootstrap_utils.alert({'class': 'alert-danger', html: alert_element}));
        });
    });
}

function init_save_button() {
    var saveb = $("#save-notebook");
    saveb.click(function() {
        shell.save_notebook();
    });
    shell.notebook.controller.save_button(saveb);
}

function init_port_file_buttons() {
    $('#export-notebook-file').click(function() {
        shell.export_notebook_file();
    });
    $('#import-notebook-file').click(function() {
        shell.import_notebook_file();
    });
}

function init_navbar_buttons() {
    init_fork_revert_button();
    init_github_buttons();
    init_save_button();
    init_port_file_buttons();
    init_upload_pane();
}

var oob_handlers = {
    "browsePath": function(v) {
        var x=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        var width=600;
        var height=500;
        var left=screen.width-width;
        window.open(x,'RCloudHelp','width='+width+',height='+height+',scrollbars=yes,resizable=yes,left='+left);
    }
};

function main_init() {
    resize_side_panel();
    init_navbar_buttons();

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });
    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            if (!rcloud.authenticated) {
                rclient.post_error(rclient.disconnection_error("Please login first!"));
                rclient.close();
                return;
            }
            rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {
                rclient.post_response(hello);
            });

            $("#new-md-cell-button").click(function() {
                shell.new_markdown_cell("", "markdown");
                var vs = shell.notebook.view.sub_views;
                vs[vs.length-1].show_source();
            });
            $("#rcloud-logout").click(function() {
		// let the server-side script handle this so it can
		// also revoke all tokens
                window.location.href = '/logout.R';
            });
            $(".collapse").collapse();
            rcloud.init_client_side_data();

            shell.init();
            var notebook = null, version = null;
            if (location.search.length > 0) {
                function getURLParameter(name) {
                    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
                }
                notebook = getURLParameter("notebook");
                version = getURLParameter("version");
            }
            editor.init(notebook, version);
            $("#tabs").tabs("select", "#tabs-2");
        },
        on_data: function(v) {
            v = v.value.json();
            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
        }
    });
}

window.onload = main_init;
