var date_filter = function(selector) {  
    this.$el_ = $(selector + ' select');
    this.on_change = new event(this);

    var that = this;
    this.$el_.on('change', function() {
        that.on_change.notify({
            prop: 'tree-filter-date', 
            value: $(this).val()
        });
    });

    this.val = function(value) {
        this.$el_.val(value);
    }
};

date_filter.protoype = {
    
};