

define(['angular'], function(angular){

   'use strict';

   console.log("selectize ready????");

   return angular.module('myapp.controllers', ['myapp.services', 'selectize'])

   .controller('NotebookProtectionController', ['$scope' , 'GroupsService', function ($scope, GroupsService){

   	$scope.welcomeMessage = 'hello, angular is working';

   	//user stuff
   	$scope.userLogin;
	$scope.userId;
    
    //notebood stuff
    $scope.notebookFullName;
    $scope.notebookGistName;
    $scope.notebookId;


    //selectize stuff
    $scope.myModel = ['anatoliy', 'gordon', 'simon'];
	$scope.myConfig = { openOnFocus: false }
	$scope.myOptions = ['anatoliy', 'gordon', 'simon', 'jim', 'eliot', 'lidiya', 'peter', 'nikita', 'arseni', 'tawan', 'vlad', 'joel', 'wally', 'petey'];


	//
	$scope.belongsToGroup = false;


	//groups stuff
	$scope.currentGroupName = '';
	$scope.allUsersGroups = [];

	// $scope.operators = [{
	//        value: 'group1',
	//        displayName: 'group1'
	//    }, {
	//        value: 'group2',
	//        displayName: 'group2'
	//    }, {
	//        value: 'group3',
	//        displayName: 'group3'
	//    }, {
	//        value: 'group4',
	//        displayName: 'group4'
	//    }, {
	//        value: 'group5',
	//        displayName: 'group5'
	//    }]

	

	$scope.filterCondition = {
        operator: 'anatoliy123'
    }



    $scope.renameGroup = function(){
    	var newGroup = prompt("Enter new group name", "");
    }


    $scope.deleteGroup = function(){
    	var r = confirm("Are you sure you want to delete this group?");
    }



	$scope.applyCurrentData = function(){

		$scope.$evalAsync(function(){

			$scope.userId = RCloud.UI.notebook_protection.userId;
		    $scope.userLogin = RCloud.UI.notebook_protection.userLogin;

		    //notebood stuff
		    $scope.notebookFullName = RCloud.UI.notebook_protection.notebookFullName;
		    $scope.notebookGistName = RCloud.UI.notebook_protection.notebookGistName;
		    $scope.notebookId = RCloud.UI.notebook_protection.notebookId;
		    $scope.belongsToGroup = RCloud.UI.notebook_protection.belongsToGroup;
		    
		    if(RCloud.UI.notebook_protection.belongsToGroup)
		    	$scope.currentGroupName = RCloud.UI.notebook_protection.currentGroupName;

		});
	}


	$scope.getUsersGroups = function(){

		console.log('getting groups for '+$scope.userLogin);
		GroupsService.getUsersGroups($scope.userLogin)
		.then(function(data){

			var finalArray = [];
			//var massagedData = $scope.generateGroups(data);
			var keys = _.keys(data);
			var vals = _.values(data);

			for(var i = 0; i < vals.length; i ++){
				var val = vals[i];
			
				if( _.isArray(val) ){

					var groupArray = [];
					groupArray.push(keys[i]); //push the group id
					groupArray.push(val[0]);  //group name
					groupArray.push(val[1]);  //is group admin

					finalArray.push(groupArray);
				}
			}

			$scope.$evalAsync(function(){
				$scope.allUsersGroups = finalArray;
			});

			//console.log(massagedData);
			console.log(finalArray);
		})
		.catch(function(){
			console.log('error getting users groups');
		});
	};




	//apply angular bindings
	$scope.applyCurrentData();

	//get user's groups
	_.delay(function(){
		$scope.getUsersGroups();
	}, 100);       



	$scope.getCurrentGroups = function(){

	};



	$scope.getFinalModel = function(){

		console.dir($scope.myModel);

	}


   }]);

});
