var date_filter = function(selector) {  
    this.$el_ = $(selector + ' select');
    this.on_change = new event(this);

    var that = this;
    this.$el_.on('change', function() {
        that.on_change.notify({
            prop: 'tree_filter_date', 
            value: $(this).val()
        });
    });
};

date_filter.protoype = {

};