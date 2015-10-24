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

                //, app, imagesLoaded, Isotope
              ], function(angular, app, imagesLoaded, Isotope) {
                  'use strict';

                  console.log('good');
    
                  //console.log('imagesLoaded is '+imagesLoaded);
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

                      $('#discovery-page-dialog').modal({keyboard: false});
                    }, 200);
     
                  });

            });
          
        },

        buildDom: function() {

          var body = $('<div class="container"></div>');
            body.append(RCloud.UI.panel_loader.load_snippet('discovery-page-modal'));

          var header = $(['<div class="modal-header">',
                        '<button type="button" class="close" aria-hidden="true">&times;</button>',
                        '<img src="/img/logo_rcloud.png" width="132" height="30" style="margin-top: -10px">'+
                        '<h3 style="display: inline-block;margin-left: 22px;">DISCOVERY PAGE</h3>',
                        '</div>'].join(''));
          var dialog = $('<div id="discovery-page-dialog" class="modal fade"></div>')
            .append($('<div class="modal-dialog full"></div>')
            .append($('<div class="modal-content"></div>')
            .append(header).append(body)));
          $("body").append(dialog);

        }        
    };

})();
