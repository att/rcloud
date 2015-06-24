RCloud.UI.notebook_protection_logger = {

    timeout: 0,

    log: function(val){
        var that = this;
        $('.logging-panel').removeClass('red');
        $('.logging-panel').removeClass('white');
        $('.logging-panel').addClass('green');
        $('.logging-panel span').text(val);

        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
            $('.logging-panel span').html('&nbsp;');

        },  10000);

    },

    warn: function(val){
        var that = this;
        $('.logging-panel').removeClass('green');
        $('.logging-panel').removeClass('white');
        $('.logging-panel').addClass('red');
        $('.logging-panel span').text(val);


        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
            $('.logging-panel span').html('&nbsp;');

        },  10000);
    }
}
