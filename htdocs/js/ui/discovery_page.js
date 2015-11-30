RCloud.UI.discovery_page = (function() {

    return {

        init: function(state) {

            var that = this;
            this.buildDom();

            require([
                'angular',
                './../../js/ui/discovery_page_app',
                './../../lib/js/imagesloaded',
                './../../lib/js/masonry.pkgd.min'

              ], function(angular, app, imagesLoaded, Masonry) {
                  'use strict';

                  window.imagesLoaded = imagesLoaded;
                  window.Masonry = Masonry;

                  angular.element(document).ready(function() {

                    _.delay(function() {
                      angular.bootstrap($('#discovery-app')[0], ['DiscoveryPageApp']);
                      angular.resumeBootstrap();
                    }, 100);
                  });
            });
        },

        buildDom: function() {
          $("#main-div").append(RCloud.UI.panel_loader.load_snippet('discovery-page-modal'));
        }
    };

})();
