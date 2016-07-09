RCloud.UI.notebook_protection = (function() {

    //set from outside
    this.defaultCryptogroup = null;
    this.defaultNotebook = null;
    this.userId = null;
    this.userLogin = null;

    this.appScope = null;
    this.appInited = false;

    return {

        init: function(state) {

          if(!this.appInited) {

            this.appInited = true;
            this.buildDom();
            var that = this;

            require([
                'angular',
                './../../js/ui/notebook_protection_app',
                'angular-selectize'
              ], function(angular, app, selectize) {
                  'use strict';

                  //var $html = angular.element(document.getElementsByTagName('html')[0]);
                  angular.element(document).ready(function() {
                      _.delay(function() {
                        angular.bootstrap($('#protection-app')[0], ['NotebookProtectionApp']);
                        angular.resumeBootstrap();
                      }, 100);
                      _.delay(function() {
                        that.appScope = angular.element(document.getElementById("protection-app")).scope();
                        that.launch(state);
                        $('#notebook-protection-dialog').modal({keyboard: false});
                      }, 200);
                  });
            });
          }
          else {
            this.launch(state);
            $('#notebook-protection-dialog').modal({keyboard: false});
          }
        },

        launch: function(state) {

          if(state === 'both-tabs-enabled') {
            //restores both tabs to working condition
            $('#protection-app #tab2')
              .removeClass('active');

            $('#protection-app #tab1')
              .removeClass('disabled')
              .addClass('active');

            $('#protection-app #tab1 a')
              .attr('href', '#notebook-tab')
              .attr('data-toggle', 'tab');

            $('#protection-app #tab2 a')
              .tab('show');
            $('#protection-app #tab1 a')
              .tab('show');

            this.appScope.initBoth();
          }
          else if(state === 'group-tab-enabled') {
            //makes it so the first tab is not clickable
            $('#protection-app #tab1')
              .removeClass('active')
              .addClass('disabled');

            $('#protection-app #tab1 a')
              .attr('href', '#')
              .removeAttr('data-toggle');

            $('#protection-app #tab2 a')
              .tab('show');

            this.appScope.initGroups();
          }
        },

        buildDom: function() {

          var body = $('<div class="container"></div>');
          body.append(RCloud.UI.panel_loader.load_snippet('notebook-protection-modal'));

          var header = $(['<div class="modal-header">',
                          '<button type="button" class="close" onClick="(RCloud.UI.notebook_protection.close.bind(RCloud.UI.notebook_protection))()" aria-hidden="true">&times;</button>',
                          '<h3>Notebook Permissions / Group Management</h3>',
                          '</div>'].join(''));
          var dialog = $('<div id="notebook-protection-dialog" class="modal fade"></div>')
            .append($('<div class="modal-dialog"></div>')
            .append($('<div class="modal-content"></div>')
            .append(header).append(body)));
          $("body").append(dialog);

        },

        close: function() {
          this.appScope.cancel();
        }
    };

})();
