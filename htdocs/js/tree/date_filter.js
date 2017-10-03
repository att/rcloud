var date_filter = function(selector) {  
    this.$el_ = $(selector + ' select');
    this.on_change = new event(this);

    var that = this;
    this.$el_.on('change', function() {
        that.on_change.notify({
            prop: 'bydate', 
            value: $(this).val()
        });
    });

    this.generate_options = function() {
        [
            { value: 'last7', text: 'Last 7 Days' },
            { value: 'last30', text: 'Last 30 Days' }
        ].forEach(function(item) {
            that.$el_.append($('<option/>').attr({
                'value': item.value
            }).html(item.text));
        });
    };
};

date_filter.protoype = {

};