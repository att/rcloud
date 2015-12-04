({
    create_context: function(selector, k) {
        k(RCloud.UI.output_context.create(selector));
    },
    close_context: function(context_id) {
        RCloud.UI.output_context.close(context_id);
        k();
    }
})
