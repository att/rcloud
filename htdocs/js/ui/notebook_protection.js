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

    this.onlyShowGroupView;

    this.appScope = null;


    return {

        init: function(state) {

          if(!this.appInited){

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

                      _.delay(function(){
                        angular.bootstrap($('#protection-app')[0], ['NotebookProtectionApp']);
                        angular.resumeBootstrap();
                      }, 100); 

                      _.delay(function(){
                        appScope = angular.element(document.getElementById("protection-app")).scope();

                        that.setAppState(state);
                        $('#notebook-protection-dialog').modal({keyboard: false});

                      }, 200);             
                  });   
            });
          }
          else{

            this.setAppState(state);
            $('#notebook-protection-dialog').modal({keyboard: false});
          }

        },

        setAppState: function(state) {

          if(state === 'both-tabs-enabled') {

            //restores both tabs to working condition
            $('#protection-app #tab2')
              .removeClass('active');

            $('#protection-app #tab1')
              .removeClass('disabled')
              .addClass('active');

            $('#protection-app #tab1 a').attr('href', '#notebook-tab');
            $('#protection-app #tab1 a').attr('data-toggle', 'tab');

            $('#protection-app #tab1 a').tab('show');


            appScope.initBoth();

            // $('a[data-toggle="tab"]').on('click', function(){
            //   return true;
            // });

          }
          else if(state === 'group-tab-enabled') {

            //makes it so the first tab is not clickable
            $('#protection-app #tab1')
              .removeClass('active')
              .addClass('disabled');

            $('#protection-app #tab1 a').attr('href', '#');
            $('#protection-app #tab1 a').removeAttr('data-toggle');

            $('#protection-app #tab2 a').tab('show');
            //$('#protection-app #tab1 a').data

            appScope.initGroups();

            // $('a[data-toggle="tab"]').on('click', function(){
            //   if ($(this).parent('li').hasClass('disabled')) {
            //     return false;
            //   };
            // });


          }
        },

        show: function(justGroupView){

          this.showOnlyGroupView = justGroupView;

          if(!this.appInited){

            
            //this.passedData = data;

            
          }
          else{

            //need to re-digest all 
            $(document).trigger('notebook_protection_reset');
            //console.log('notebook_protection_reset triggered');

            
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
            
        }
    };


    
})();
