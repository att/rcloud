({
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
