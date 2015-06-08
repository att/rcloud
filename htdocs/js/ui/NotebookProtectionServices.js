define([], function(){

   'use strict';

   return angular.module('myapp.services', [])

   .service('GroupsService', function() {

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

});




