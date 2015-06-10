

define(['angular'], function(angular){

   'use strict';

   return angular.module('myapp.controllers', ['myapp.services', 'selectize'])
   .controller('NotebookProtectionController', ['$scope' , 'GroupsService', function ($scope, GroupsService){


   		//Notebook tab vars
   		///////////////////////////////

	   	//user 
	   	$scope.userLogin;
		$scope.userId;
	    
	    //notebood 
	    $scope.notebookFullName;
	    $scope.notebookGistName;
	    $scope.notebookId;
	    $scope.belongsToGroup = false;

		//groups 
		$scope.currentGroupName = '';
		$scope.allUsersGroups = [];

		//value of the select dropdown
		$scope.selectedGroup1 = '';

		//tab/state
		$scope.currentTab = 1;



		//Group tab vars
   		///////////////////////////////

   		//ref to global var storing all users
		$scope.allUsers = window.allTheUsers;

		//selectize config
		$scope.myConfig = { openOnFocus: false }

		//value of the select dropdown
		$scope.selectedGroup2 = '';

		//group admins
		$scope.groupAdmins = [];
		//group members
		$scope.groupMembers = [];


		//checks and balances
		$scope.originalAdmins = [];
		$scope.originalMembers = [];

		//way to stop watching collections
		$scope.theWatcherAdmins;
		$scope.theWatcherMembers;


		//NOTEBOOK TAB METHODS
		/////////////////////////////////////////

		$scope.applyCurrentData = function(){

			$scope.$evalAsync(function(){

				$scope.userId = RCloud.UI.notebook_protection.userId;
			    $scope.userLogin = RCloud.UI.notebook_protection.userLogin;
			    //notebood stuff
			    $scope.notebookFullName = RCloud.UI.notebook_protection.notebookFullName;
			    $scope.notebookGistName = RCloud.UI.notebook_protection.notebookGistName;
			    $scope.notebookId = RCloud.UI.notebook_protection.notebookId;
			    $scope.belongsToGroup = RCloud.UI.notebook_protection.belongsToGroup;

			    if(RCloud.UI.notebook_protection.belongsToGroup){
			    	$scope.currentGroupName = RCloud.UI.notebook_protection.currentGroupName;
			    	//set the select to the right option
			    	//$scope.filterCondition.operator = RCloud.UI.notebook_protection.currentGroupName;
			    }
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
						var obj = {};
						obj.id = (keys[i]); //group id
						obj.name = (val[0]);  //group name
						obj.isAdmin = (val[1]);  //group is-admin

						finalArray.push(obj);
					}
				}

				var theIndex;
				for(var i = 0; i < finalArray.length; i ++){
					if(finalArray[i].name === $scope.currentGroupName ){
						theIndex = i;
					}
				}

				$scope.$evalAsync(function(){
					$scope.allUsersGroups = finalArray;
					$scope.selectedGroup1 = finalArray[theIndex];

					$scope.selectedGroup2 = finalArray[theIndex];//finalArray[0];

					//console.log('final array'+finalArray);
				});

				//console.log(massagedData);
				//console.log(finalArray);
			})
			.catch(function(e){
				console.log('error getting users groups'+e);
			});
		};


		$scope.init = function(){

			//apply angular bindings
			$scope.applyCurrentData();

			//get current user's groups
			_.delay(function(){
				$scope.getUsersGroups();
			}, 40); 

			_.delay(function(){
				//$scope.getAllUsers();
			}, 100)

		}


		$scope.reset = function(){

			$scope.userLogin = '';
			$scope.userId = '';
		    
		    //notebood stuff
		    $scope.notebookFullName = '';
		    $scope.notebookGistName = '';
		    $scope.notebookId;

			$scope.belongsToGroup = false;

			//groups stuff
			$scope.currentGroupName = '';
			$scope.allUsersGroups = [];
		}

	

		$scope.saveNotebookTab = function(){

			//console.log($scope.filterCondition.operator);

			//if making private of moving to another group
			if($scope.belongsToGroup){

				var conf = confirm("Are you sure you want to move your notebook to this group?");
				if(conf){
					console.log('notebook id is '+$scope.notebookGistName);
					GroupsService.setNotebookGroup($scope.notebookGistName, $scope.selectedGroup1.id )
					.then(function(data){
						console.log('data is '+data);
						//need to update the notebook's tip to reflect the change

					})
					.catch(function(e){
						console.log(e)
					})
				}
			}
			/*else{

				var conf = confirm("Are you sure you want to make your notebook public?");
				if(conf){
					console.log('notebook id is '+$scope.notebookGistName);
					GroupsService.setNotebookGroup($scope.notebookGistName, $scope.filterCondition.operator )
					.then(function(data){
						console.log('data is '+data);
					})
					.catch(function(e){
						console.log(e)
					})
				}
			}*/
		}

		

		//GROUP TAB METHODS
		/////////////////////////////////////////

	    $scope.createGroup = function(){
	    	var pr = prompt("Enter new group name", "");

	    	if (pr != null) {

                GroupsService.createGroup(pr)
                .then(function(data){

                    $scope.$evalAsync(function(){

                    	$scope.allUsersGroups.push({
                    		id:data,
                    		name:pr,
                    		isAdmin:true
                    	});
                    });
                    console.log('group created '+data);
                })
                .catch(function(e){
                    alert(e);
                })
	            
			}
	    }

	    $scope.renameGroup = function(){
	    	var pr = prompt("Enter new group name", $scope.selectedGroup2.name);

	    	if (pr != null) {
				var r = confirm('Are you sure you want to rename "'+$scope.selectedGroup2.name+' to "'+pr+'"?');

				if(r === true){

					//var groupId;
	                var prevGroupId = $scope.selectedGroup2.id;
	                GroupsService.changeGroupName($scope.selectedGroup2.id ,pr)
	                .then(function(data){
	                    //groupId = data;

	                    var theIndex;
						for(var i = 0; i < $scope.allUsersGroups.length; i ++){
							if($scope.allUsersGroups[i].id === $scope.selectedGroup2.id ){
								theIndex = i;
								console.log('at index '+i);
							}
						}

	                    $scope.$evalAsync(function(){

	                    	$scope.allUsersGroups[theIndex].name = pr;
	                    });

	                    //console.log('group changed '+data);
	                    //alert('group created');

	                })
	                .catch(function(e){
	                    alert(e);
	                })

				}  
			}
	    }

	    $scope.deleteGroup = function(){
	    	var r = confirm('Are you sure you want to delete'+$scope.selectedGroup2.name+'?');
	    	if(r === true){
	    		GroupsService.deleteGroup($scope.selectedGroup2.id)
	    		.then(function(data){
	    			console.log('deleted '+data);

	    			var theIndex;
					for(var i = 0; i < $scope.allUsersGroups.length; i ++){
						if($scope.allUsersGroups[i].id === $scope.selectedGroup2.id ){
							theIndex = i;
							//console.log('at index '+i);
						}
					}

                    $scope.$evalAsync(function(){
                    	//remove that item from array
                    	$scope.allUsersGroups.splice([theIndex], 1);
                    	//reset the select
                    	$scope.selectedGroup2 = $scope.allUsersGroups[0];
                    });
	    		})
	    		.catch(function(e){
                    alert(e);
                })
	    	}
	    }


	    //Admins and Memebers areas
	    ///////////////////////////


	    $scope.startWatchingGroups = function(){

	    	var count1 = 0;
	    	var count2 = 0;

	    	$scope.theWatcherAdmins = $scope.$watch('groupAdmins', function (val){

	    		if(count1 === 0){
	    			count1 ++;
	    			return
	    		}
	    		else{
	    			count1 ++;
	    			//logic here

	    			console.log('groupAdmins changed '+val);
	    			//console.log('groupAdmins is '+$scope.groupAdmins);

	    			var duplicates = _.intersection($scope.groupAdmins, $scope.groupMembers);
	    			if(duplicates.length){
	    				console.log('removing '+duplicates+' from members and moving it to admins');
	    				//remove 
	    				var dupIndex = $scope.groupMembers.indexOf(duplicates[0]);
	    				$scope.groupMembers.splice(dupIndex, 1);
	    			}
	    			//console.log('dupes are '+duplicates);
	    		}
			});

			$scope.theWatcherMembers = $scope.$watch('groupMembers', function (val){

	    		if(count2 === 0){
	    			count2 ++;
	    			return
	    		}
	    		else{
	    			count2 ++;

	    			//logic here
	    			console.log('groupMembers changed '+val);

	    			var duplicates = _.intersection($scope.groupMembers, $scope.groupAdmins);
	    			if(duplicates.length){
	    				console.log('removing '+duplicates+' from admins and moving it to members');
	    				//remove 
	    				var dupIndex = $scope.groupAdmins.indexOf(duplicates[0]);
	    				$scope.groupAdmins.splice(dupIndex, 1);
	    			}

	    		}
			});

	    }


	    $scope.startWatching = function(){
	    	//console.log($scope.selectedGroup2);
	    	$scope.startWatchingGroups();
	    }

	    $scope.stopWatching = function(){

	    	//stop watching admin and member models
	    	$scope.theWatcherAdmins();
	    	$scope.theWatcherMembers();
	    }


	    $scope.populateGroupMembers = function(){		

			GroupsService.getAllUsersinGroup($scope.selectedGroup2.id)
			.then(function(data){

				var adminsArray = [];
				var membersArray = [];

				for(var item in data){
					if(item !== 'r_attributes' && item !== 'r_type'){

						if(data[item] === true)
							adminsArray.push(item);
						else
							membersArray.push(item);
					}
				}

				console.log('just grabed memebers info for group '+$scope.selectedGroup2.name);

				$scope.$evalAsync(function(){

					$scope.groupAdmins = adminsArray;
					//$scope.groupMembers = membersArray;
					$scope.groupMembers = ['fourthark','gordonwoodhull']; //for testing's sake
				});

				//using defer to make sure the above evalAsync has had time to comple
				//_.defer(function(){

					//save the original values
					$scope.originalAdmins = adminsArray.slice(0);//$scope.groupAdmins.slice(0);
					// $scope.originalMembers = $scope.groupMembers.slice(0);
					$scope.originalMembers = ['fourthark','gordonwoodhull'];

					$scope.startWatchingGroups();

				//})

			})
			.catch(function(e){
				console.log(e);
			})
		}


		$scope.anotherGroupSelected = function(){
			$scope.populateGroupMembers();
		}



		$scope.saveGroupTab = function(){

			//compare original members array and its current state


			//compare original admins array and its current state
			var removedAdmins = _.difference($scope.originalAdmins, $scope.groupAdmins);
			var addedAdmins = _.difference($scope.groupAdmins, $scope.originalAdmins);

			var removedMembers = _.difference($scope.originalMembers, $scope.groupMembers);
			var addedMembers = _.difference($scope.groupMembers, $scope.originalMembers);

			var outputMessage = '';

			//removed and added members

			if(!removedAdmins.length && !addedAdmins.length && !removedMembers.length && !addedMembers.length ){
				outputMessage += 'nothing has changed, so why are you saving this?';
				alert(outputMessage);
			}
			else{
				outputMessage += 'Please confirm the following changes:\n\n';
				if(removedAdmins.length){
					outputMessage += 'you removed admins \n';
					for(var i = 0; i < removedAdmins.length; i ++){
						outputMessage += '   - '+removedAdmins[i]+'\n';
					}
				}

				if(addedAdmins.length){
					outputMessage += 'you added admins \n';
					for(var a = 0; a < addedAdmins.length; a ++){
						outputMessage += '   - '+addedAdmins[a]+'\n';
					}
				}

				if(removedMembers.length){
					outputMessage += 'you removed members \n';
					for(var b = 0; b < removedMembers.length; b ++){
						outputMessage += '   - '+removedMembers[b]+'\n';
					}
				}

				if(addedMembers.length){
					outputMessage += 'you added members \n';
					for(var v = 0; v < addedMembers.length; v ++){
						outputMessage += '   - '+addedMembers[v]+'\n';
					}
				}

				var pr = confirm(outputMessage);
					
			}
		}
		     

		//Dealing with tabs and keeping state
		//////////////////////////////////////////////////

		$(document).on('notebook_protection_reset', function(){
			$scope.reset();
			$scope.init();
		});

		$scope.setTab = function(index){

			$scope.currentTab = index;
			if(index ===1){
				$scope.stopWatching()
			}

			if(index === 2){
				_.delay(function(){
					$scope.populateGroupMembers();	
				}, 40);
			}
		}


		//Global Save and Cancel
		////////////////////////////////////////////

		$scope.cancel = function(){

			$("#notebook-protection-dialog").modal('hide');
			$scope.reset();
		}


		$scope.save = function(){

			if($scope.currentTab === 1){
				$scope.saveNotebookTab();
			}
			else{
				$scope.saveGroupTab();
			}
			console.log('current tab is '+$scope.currentTab);

		}

		//init the app
		$scope.init();

   	}]);

});
