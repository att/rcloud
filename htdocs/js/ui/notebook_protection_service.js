define(['angular'], function(angular){

   'use strict';

   return angular.module('myapp.services', [])

   .service('GroupsService', function() {

        this.setCurrentUser = function(user){

        };

        // rcloud.protection.set_cryptgroup_name = function(groupid, groupname) {
        //     return rcloud_ocaps.protection.set_cryptgroup_nameAsync(groupid, groupname);
        // };

        this.getAllUsersinGroup = function(groupid) {
            return rcloud.protection.get_cryptgroup_users(groupid);
        };

        this.deleteGroup = function(groupid){
            return rcloud.protection.delete_cryptgroup(groupid);
        };

        this.changeGroupName = function(groupid, groupname){
            return rcloud.protection.set_cryptgroup_name(groupid, groupname);
        };

        this.getNotebookGroup = function(id) {
             return rcloud.protection.get_notebook_cryptgroup(id);
        };

        this.setNotebookGroup = function(notebookid, groupid){
            return rcloud.protection.set_notebook_cryptgroup(notebookid, groupid);
        };

        this.createGroup = function(groupName){
            return rcloud.protection.create_cryptgroup(groupName);
        };


        this.addGroupUser = function(groupid, user, is_admin){
            return rcloud.protection.add_cryptgroup_user(groupid, user, is_admin);
        };

        this.removeGroupUser = function(groupid, user){
            return rcloud.protection.remove_cryptgroup_user(groupid, user);
        };

        this.getUsersGroups = function(user){
            return rcloud.protection.get_user_cryptgroups(user);
        };

        //this.removeUserFromGroup


        // rcloud.protection.remove_cryptgroup_user = function(groupid, user) {
        //     return rcloud_ocaps.protection.remove_cryptgroup_userAsync(groupid, user);
        // };



    });

});
