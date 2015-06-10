RCloud.UI.notebook_protection = (function() {

    this.passedData = null;
    this.appInited = false;
    this.theApp = null;


    //set from outside
    this.userId;
    this.userLogin;

    //notebood stuff
    this.notebookFullName;
    this.notebookGistName;
    this.notebookId;

    //group stuff
    this.belongsToGroup;
    this.currentGroupName;

    this.tipEl;//tooltip element to update


    return {

        init: function(){

          if(!this.appInited){

            this.appInited = true;
            this.buildDom();
            //this.passedData = data;

            require([
                'angular',
                './../../js/ui/notebook_protection_app',
                'angular-selectize'
              ], function(angular, app, selectize) {
                  'use strict';
                  //var $html = angular.element(document.getElementsByTagName('html')[0]);  
                  angular.element(document).ready(function() {   

                      setTimeout(function(){

                        angular.bootstrap($('#protection-app')[0], ['NotebookProtectionApp']);
                        angular.resumeBootstrap();

                      }, 100);             
                  });
            });

          }
          else{

            //need to re-digest all the 
            $(document).trigger('notebook_protection_reset');
            console.log('notebook_protection_reset triggered');

            $('#notebook-protection-dialog').modal({keyboard: false});
            return;
          }

        },


        buildDom: function(){

            var body = $('<div class="container"></div>');
            body.append(RCloud.UI.panel_loader.load_snippet('notebook-protection-modal'));

            
            var header = $(['<div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                            '<h3>Set Notebook Permissions</h3>',
                            '</div>'].join(''));
            var dialog = $('<div id="notebook-protection-dialog" class="modal fade"></div>')
                    .append($('<div class="modal-dialog"></div>')
                            .append($('<div class="modal-content"></div>')
                                    .append(header).append(body)));
            $("body").append(dialog);
            dialog.modal({keyboard: false});
            
        }
    };


    
})();
