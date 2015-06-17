

define(['angular'], function(angular){

   'use strict';

   return angular.module('myapp.controllers', ['myapp.services', 'selectize'])
   .controller('NotebookProtectionController', ['$scope' , 'GroupsService', function ($scope, GroupsService){


   		//Notebook tab vars
   		///////////////////////////////

        $scope.onlyShowGroupView = RCloud.UI.notebook_protection.onlyShowGroupView;

	   	//user 
	   	$scope.userLogin = '';
		$scope.userId = '';
	    
	    //notebood 
	    $scope.notebookFullName = '';
	    $scope.notebookGistName = '';
	    $scope.notebookId = '';
	    $scope.belongsToGroup = false;

		//groups 
		$scope.currentGroupName = '';

		$scope.allUserGroups = [];
        $scope.allAdminGroups = [];

		//value of the select dropdown
		$scope.selectedGroup1 = null;

		//tab/state
		$scope.currentTab = 1;



		//Group tab vars
   		///////////////////////////////

   		//ref to global var storing all users
		$scope.allUsers = editor.allTheUsers;
        $scope.allAdminUsers = [];

		//selectize config
		$scope.myConfig = { openOnFocus: false }

		//value of the select dropdown
		$scope.selectedGroup2 = null;

		//group admins
		$scope.groupAdmins = [];
		//group members
		$scope.groupMembers = [];


		//checks and balances
		$scope.originalAdmins = [];
		$scope.originalMembers = [];

		//way to stop watching collections
		$scope.theWatcherAdmins = null;
		$scope.theWatcherMembers = null;





        $scope.initBoth = function() {
            console.log('initting both tabs');
        }


        $scope.initGroups = function(){
            console.log('initting just groups');
        }

   	}]);

});



