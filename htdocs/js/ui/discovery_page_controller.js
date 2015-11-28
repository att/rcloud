define(['angular'], function(angular) {

   'use strict';

   //define module
    return angular.module('myapp.discovery', [])
    /// <thumbnail/> directive
    .directive("thumbnail", function(){ 

        return {
            restrict: "E",
            replace: true,
            templateUrl: "grid-item.html",
            link: function(scope, iElement, iAttrs, controller){
                ///once the element is created, listen for error on img load
                //and replace with default img
                iElement.find('img').bind("error" , function(e){ 
                    $(this).attr('src', './img/missing.png');
                });

            }
        }
    })
    //define controller
    .controller('DiscoveryPageController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) { 
        //used in html with ng-repeat notebook in recentNotebooks
        $scope.recentNotebooks = [];

        function init() {
            //rcloud should be available, so
            //get the recent notebooks
            rcloud.config.get_recent_notebooks()
            .then(function(data){
                var sorted = _.chain(data)
                .pairs()
                .filter(function(kv) { 
                    return kv[0] != 'r_attributes' && kv[0] != 'r_type' && !_.isEmpty(editor.get_notebook_info(kv[0])) ; 
                })
                .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                .sortBy(function(kv) { return kv[1] * -1; })
                .value();

                //store in a temporary array
                var recentTemp = [];
                //sorted.shift();//remove the first item
                sorted = sorted.slice(0, 20); //limit to 20 entries

                for(var i = 0; i < sorted.length; i ++) {

                    var currItem = sorted[i];
                    var currentNotebook = editor.get_notebook_info(sorted[i][0]);
                  
                    var data = {
                        id: currItem[0],
                        time: currItem[1],
                        description: currentNotebook.description,
                        last_commit: new Date(currentNotebook.last_commit).toDateString(),
                        username: currentNotebook.username
                    };
                    recentTemp.push(data)
                    //$scope.recentNotebooks.push(data);                   
                }

                //so have to $apply just once
                $scope.$evalAsync(function() {
                    $scope.recentNotebooks = recentTemp;
                });

                _.delay(function() {

                    //listen to images loaded
                    var imgLoad = imagesLoaded( $('.grid')[0] );
                    imgLoad.on( 'always', function( instance ) {
                        console.log('ALWAYS - all images have been loaded');
                        //run masonry on grid
                        _.delay(function() {
                            new Masonry( '.grid', {
                              itemSelector: '.grid-item'      
                            });
                        }, 200);
                        //reveal page and hide loader
                        _.delay(function() {
                            $('.grid').css('visibility', 'visible');  
                            $('#discovery-app').css('visibility', 'visible'); 
                            $('.loader-icon').css('display', 'none');  
                        }, 400)
                    });

                }, 300);
            
            })
        };

        $scope.getThumbUrl = function(id) {
            return "/notebook.R/"+id+"/thumb.png";
        }

        $scope.thumbClicked = function() {
            console.log('clicked');
        }

        init();


    }]);
});
