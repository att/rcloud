RCloud.UI.notebook_protection_logger = {
    timeout: 0,
    log: function(val) {
        var that = this;
        $('.logging-panel').removeClass('red')
            .removeClass('white')
            .addClass('green');

        $('.logging-panel span').text(val);

        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
            $('.logging-panel span').html('&nbsp;');
        }, 20000);
    },
    warn: function(val) {
        var that = this;
        $('.logging-panel').removeClass('green')
            .removeClass('white')
            .addClass('red');
        $('.logging-panel span').text(val);

        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
            $('.logging-panel span').html('&nbsp;');
        }, 20000);
    },
    clear: function(){
        $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
        $('.logging-panel span').html('&nbsp;');
    }
};
