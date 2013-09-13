({
    handle_dcchart: function(data, k) {
        var charts;
        try {
            charts = dcrchart.translate(data[2]);
        }
        catch(e) {
            k(function() { $('<p/>').append("Exception creating dc code: " + e); });
            return;
        }
        var rdata = data[1];
        setTimeout(function() { charts.dcfunc(rdata); }, 10);
        k(function() { return charts.elem; });
    },
    handle_dcplot: function(data, k) {
        var charts, elem;
        try {
            charts = wdcplot.translate.apply(null,data.slice(1));
        }
        catch(e) {
            k(function() { 
                return $('<p/>').append("Exception creating dcplot definition: " + e);
            });
            return;
        }
        try {
            var dccharts = dcplot(charts.dataframe, charts.groupname, charts.defn);
            _.extend(window.charts, dccharts);
        }
        catch(e) {
            k(function() {
                return wdcplot.format_error(e);
            });
            return;
        }
        k(function() { return charts.elem; });
    }
})
