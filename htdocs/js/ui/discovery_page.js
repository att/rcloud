RCloud.UI.discovery_page = (function() {

    return {

        init: function(state) {

            var that = this;
            this.buildDom();

            require([
                'angular',
                './../../js/ui/discovery_page_app',
                './../../lib/js/imagesloaded',
                './../../lib/js/isotope.pkgd.min'

              ], function(angular, app, imagesLoaded, Isotope) {
                  'use strict';

                  window.imagesLoaded = imagesLoaded;
                  window.Isotope = Isotope;

                  imagesLoaded( document.body, function() {
                    console.log('images loaded')
                  });


                  //var $html = angular.element(document.getElementsByTagName('html')[0]);
                  angular.element(document).ready(function() {

                    _.delay(function() {
                      angular.bootstrap($('#discovery-app')[0], ['DiscoveryPageApp']);
                      angular.resumeBootstrap();
                    }, 100);

                    _.delay(function() {
                      // Replace source
                      $('img').error(function(){
                        //alert('error has happened');
                        $(this).attr('src', './img/missing.png');
                      });

                    }, 150);

                  });
            });
        },

        buildDom: function() {
          $("#main-div").append(RCloud.UI.panel_loader.load_snippet('discovery-page-modal'));
        }        
    };

})();
