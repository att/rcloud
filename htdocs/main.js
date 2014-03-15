Promise.longStackTraces();

/* Added these functions for supporting search functionality */

function search(){	
	var qry = $('#input-text-search').val();
	rcloud.custom_search(qry); 
	return;
}

function hide_popup(){
	$("#divPopup").hide();
	$("#divClose").hide();
	$("#popup").modal('hide');
}

function show_popup(table_content,qry,len,qtime){
	qry = decodeURIComponent(qry);
	qry = qry.replace(/\</g,'&lt;');
	qry = qry.replace(/\>/g,'&gt;');
	$("#popup").modal({show:true});
	$("#divPopup").show(200);
	$("#divClose").show(200);
	$("#divPopup").html(table_content);
	$("#divClose").html("Search For: <b>" +qry+"</b> <i style=\"font-size:10px\">Results Found:"+len+"</i><i style=\"font-size:10px\"> Response Time:"+qtime+"ms</i><div style=\"float:right; cursor: pointer;\" data-dismiss='modal' onclick='hide_popup();'><b>[x]&nbsp;</b></div>");	
};
/*--------------------------END--------------------------*/
window.onload = function() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    RCloud.UI.init();
    RCloud.session.init().then(function() {
        var notebook = null, version = null;
        if (location.search.length > 0) {
            notebook = getURLParameter("notebook");
            version = getURLParameter("version");
        }
        shell.init();
        editor.init(notebook, version);
        /*
         // disabling navigation for now - concurrency issues
         window.addEventListener("popstate", function(e) {
         if(e.state === "rcloud.notebook") {
         var notebook2 = getURLParameter("notebook");
         var version2 = getURLParameter("version");
         editor.load_notebook(notebook2, version2, true, false);
         }
         });
         */ 
    });
};
