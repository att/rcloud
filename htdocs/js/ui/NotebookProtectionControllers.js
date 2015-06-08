// 'use strict';

// define([
// 	'angular',

// ], function(angular) {
// 	angular.module('myapp.services', [])

// 	// .config(['$routeProvider', function($routeProvider) {
// 	// 	$routeProvider.when('/view2', {
// 	// 		templateUrl: 'view2/view2.html',
// 	// 		controller: 'View2Ctrl'
// 	// 	});
// 	// }])
// 	// We can load the controller only when needed from an external file
// 	.controller('View2Ctrl', ['$scope', '$injector', function($scope, $injector) {
// 		require(['view2/ctrl2'], function(ctrl2) {
// 			// injector method takes an array of modules as the first argument
// 			// if you want your controller to be able to use components from
// 			// any of your other modules, make sure you include it together with 'ng'
// 			// Furthermore we need to pass on the $scope as it's unique to this controller
// 			$injector.invoke(ctrl2, this, {'$scope': $scope});
// 		});
// 	}]);
// });



// // define([], function(controllers){
// //     // window.TheApp.controller('NotebookProtectionController', function($scope, $routeParams){
// //     //      $scope.welcomeMessage = "testId";
// //     // });
// // });



define([], function(){

   'use strict';

   return angular.module('myapp.controllers', ['myapp.services', 'selectize'])

   .controller('NotebookProtectionController', ['$scope' , 'GroupsService', function ($scope, GroupsService){

   	$scope.welcomeMessage = 'hello, angular is working';

   	$scope.myModel = [];
	$scope.myConfig = { openOnFocus: false }
	$scope.myOptions = ['anatoliy', 'gordon', 'simon', 'jim', 'eliot', 'lidiya', 'peter', 'nikita', 'arseni', 'tawan', 'vlad', 'joel', 'wally', 'petey'];

	//alert('controlelr working');


	$scope.getFinalModel = function(){

		console.dir($scope.myModel);

	}


  //  		$scope.welcomeMessage = 'hello buddy';
  //       //alert("index ok");

  //       $scope.groupId;


  //       rcloud.get_users()
		// .then(function(data){

		// 	console.log('-----------');  
		// 	console.dir(data);
		// });



		/*GroupsService.createGroup('groupName22')
        .then(function(data){
            $scope.groupId = data;

            console.log('group created '+data);
            alert('group created');

            // return GroupsService.setNotebookGroup($scope.notebookId, groupId)
            // .then(function(data){

            //     var a = 'aa';
            //     alert('group created and this notebook added to group');
            // })



        })
        .catch(function(e){
	        alert(e);
	    })*/
   }]);

});
