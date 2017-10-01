var date_filter = function(selector) {  
    this.$el_ = $(selector + ' select');
    this.on_change = new event(this);

    var that = this;
    this.$el_.on('change', function() {
        that.on_change.notify($(this).val());
    });

    this.generate_options = function() {
        [
            { value: '<= 7', text: '< 7 Days' },
            { value: '<= 30', text: '< 30 Days' }
        ].forEach(function(item) {
            that.$el_.append($('<option/>').attr({
                'value': item.value
            }).html(item.text));
        });
    };
};

date_filter.protoype = {

};