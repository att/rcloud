(function() {
    var duration = 500;
    var on = false;

    function hide_footer()
    {
        on = false;
        d3.select("#cog")
            .transition()
            .duration(duration)
            .style("left", "-14px")
            .style("top", "14px");
        d3.select("#footer")
            .transition()
            .duration(duration)
            .style("width", "50px")
            .style("left", "100%");
    }

    function show_footer()
    {
        on = true;
        d3.select("#footer")
            .style("left", "100%")
            .transition()
            .duration(duration)
            .style("width", "100%")
            .style("left", "0px");
        d3.select("#cog")
            .transition()
            .duration(duration)
            .style("left", "7px")
            .style("top", "10px");
    }

    footer = {
        init: function() {
            _.each([d3.select("#cog"),
                    d3.select("#black-triangle-behind-cog")], 
                   function(s) {
                       s.on("click", function() {
                           if (on) {
                               hide_footer();
                           } else {
                               show_footer();
                           }
                       });
                   });
        }
    };

})();
