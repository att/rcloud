RCloud.UI.discovery_page = (function() {

    return {

        init: function(state) {

            require([
                'angular',
                './../../js/ui/discovery_page_app',
                './../../lib/js/imagesloaded',
                './../../lib/js/masonry.pkgd.min'

              ], function(angular, app, imagesLoaded, Masonry) {
                  'use strict';

                  window.imagesLoaded = imagesLoaded;
                  window.Masonry = Masonry;

                  $("#main-div").append(RCloud.UI.panel_loader.load_snippet('discovery-page-modal'));

                  angular.element(document).ready(function() {
                    _.delay(function() {
                      angular.bootstrap($('#discovery-app')[0], ['DiscoveryPageApp']);
                      angular.resumeBootstrap();
                    }, 100);
                  });
            });
        }
    };

})();
