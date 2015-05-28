RCloud.UI.notebook_protection = (function() {


    return {



        show: function(node) {

            var that = this;

            require(['angular'], function(angular){
                'use strict';

                //after you are done defining / augmenting 'MyApp' run this:
                that.buildDom();

                //angular.element(document).ready(function() {
                    //angular.resumeBootstrap([app['name']]);
                    //angular.resumeBootstrap();

                    var app = angular.module('demo', []);

                    app.service('GroupsService', function() {

                        this.getNotebookGroup = function(id) {
                             return rcloud.protection.get_notebook_cryptgroup(id)   
                        };

                        this.setNotebookGroup = function(notebookid, groupid){
                            return rcloud.protection.set_notebook_cryptgroup(notebookid, groupid);
                        }

                        this.createGroup = function(groupName){

                            return rcloud.protection.create_cryptgroup(groupName)
                        }
                         
                        this.set_notebook_cryptgroup = function(id) {
                            return rcloud.protection.get_notebook_cryptgroup(id)  
                        };

                        this.addGroupUser = function(groupid, user, is_admin){
                            return rcloud.protection.add_cryptgroup_user(groupid, user, is_admin);
                        }
                         
                    });
                    


                    app.controller('WelcomeController', function($scope, GroupsService) {
                          $scope.greeting = 'Welcome!';


                          $scope.currentNode = node;
                          $scope.notebookId = node.gistname;


                          $scope.currentGroup = 'none';

                          $scope.myGroups = null;



                          $scope.newGroupName = 'create new';



                          $scope.createGroup = function(){
                            $scope.createNewGroup( $scope.newGroupName);
                          }


                          GroupsService.getNotebookGroup($scope.notebookId)
                          .then(function(data){
                            if(data[0] && data[1]){

                                $scope.$apply(function(){
                                    $scope.currentGroup = data[1];
                                });
                                
                            }

                          });

                          $scope.createNewGroupAndAddNotebook = function(groupName, notebookId){

                          }

                          $scope.createNewGroup = function(groupName){
                            var groupId;

                            GroupsService.createGroup(groupName)
                            .then(function(data){
                                groupId = data;

                                console.log('group created '+data);
                                alert('group created');

                                return GroupsService.setNotebookGroup($scope.notebookId, groupId)
                                .then(function(data){

                                    var a = 'aa';
                                    alert('group created and this notebook added to group');
                                })



                            })
                            .catch(function(e){
                                alert(e);
                            })
                            // .then(function(){

                            //     //update your current group 
                               


                            //     //update all the groups you belong to

                            //     //alert("hahahahah");
                            // })



                          }
                          //GroupsService.createGroup('anatoliy');
                          

                          //console.log("notbook's group is "+$scope.notebook_group);



                          $scope.doEdit = function(){
                            alert("it works");
                          }
                    });

                    angular.bootstrap(document, ['demo']);



                    
                    //setTimeout(angular.resumeBootstrap, 0);
                //});
            })

            return this;
        },

        buildDom: function(){

            var body = $('<div class="container"></div>');
            body.append(RCloud.UI.panel_loader.load_snippet('notebook-protection-modal'));

            var cancel = $('<span class="btn btn-cancel">Cancel</span>')
                .on('click', function() { $(dialog).modal('hide'); });
          
            var footer = $('<div class="modal-footer"></div>')
                    .append(cancel);
            var header = $(['<div class="modal-header">',
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                            '<h3>Set Notebook Permissions</h3>',
                            '</div>'].join(''));
            var dialog = $('<div id="import-notebook-file-dialog" class="modal fade"></div>')
                    .append($('<div class="modal-dialog"></div>')
                            .append($('<div class="modal-content"></div>')
                                    .append(header).append(body).append(footer)));
            $("body").append(dialog);
            dialog.modal({keyboard: true});
            
        }
    };


        // /* create angular app here */
        // angular.element(document).ready(function () {
        //     angular.resumeBootstrap();
        //     console.log("resuming bootstrap");

        // });

        // return {
        //     show: function() {

        //         console.log('show protection modal');


        //         var body = $('<div class="container"></div>');
        //         body.append(RCloud.UI.panel_loader.load_snippet('notebook-protection-modal'));

        //         var cancel = $('<span class="btn btn-cancel">Cancel</span>')
        //             .on('click', function() { $(dialog).modal('hide'); });
              

        //         var footer = $('<div class="modal-footer"></div>')
        //                 .append(cancel);
        //         var header = $(['<div class="modal-header">',
        //                         '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
        //                         '<h3>Set Notebook Permissions</h3>',
        //                         '</div>'].join(''));
        //         var dialog = $('<div id="import-notebook-file-dialog" class="modal fade"></div>')
        //                 .append($('<div class="modal-dialog"></div>')
        //                         .append($('<div class="modal-content"></div>')
        //                                 .append(header).append(body).append(footer)));
        //         $("body").append(dialog);

        //         dialog.modal({keyboard: true});



        //         return this;
        //     }
        // };
    





    // require(['sadasdas'], function(Angular){



    // })

    
})();
