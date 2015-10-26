define(['angular'], function(angular) {

   'use strict';

    return angular.module('myapp.discovery', [])
    .directive("thumbnail", function(){
        return {
            restrict: "E",
            replace: true,
            templateUrl: "grid-item.html",
            link: function(scope, iElement, iAttrs, controller){
                // console.log($vid);
                 iElement.bind("load" , function(e){ 

                    console.log('on load happend');
                    // success, "onload" catched
                    // now we can do specific stuff:

                    // if(this.naturalHeight > this.naturalWidth){
                         //this.css('backgk') = "vertical";
                    // }
                });

            }
        }
    })
    .controller('DiscoveryPageController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

        $scope.recentNotebooks = [];

        function init() {

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
                    $scope.recentNotebooks.push(data);                   
                }

                _.delay(function() {

                    var imgLoad = imagesLoaded( $('.grid')[0] );
                    imgLoad.on( 'always', function( instance ) {
                        console.log('ALWAYS - all images have been loaded');

                        _.delay(function() {
                            new Isotope( '.grid', {
                              columnWidth: 200,
                              itemSelector: '.grid-item'      
                            });
                        }, 200);

                        _.delay(function() {
                            $('.grid').css('visibility', 'visible');
                            $('#discoveryLoader').css('display', 'none');
                        }, 400)
                    });

                }, 300);
            
                console.log('-----------------');
                console.dir($scope.recentNotebooks);
            })
        };

        $scope.getThumbUrl = function(id) {
            return "/notebook.R/"+id+"/thumb.png";
        }

        $scope.thumbClicked = function() {
            console.log('clicked');
        }

        init();

        $scope.init = function(){
            //alert("init this ");

            return;

            $scope.currentModel = [];
            rcloud.config.get_recent_notebooks()
            .then(function(data){
                console.log('00000000');
                console.dir(data);
            })

            var $grid = $('#discovery-app .grid');
            var temp  = $(RCloud.UI.panel_loader.load_snippet('grid-item'));
            //temp.remove();

            var imgArray = ['map.png', 'map2.png', 'graph.png', 'graph2.png', 'graph3.png'];

            for(var i = 0; i < 100; i ++) {

                var height = 300 + (Math.random() * 200);
                var item = temp.clone()
                    .css({
                        // height: height,
                        backgroundColor: getRandomColor
                    });
                var header = item.find('.header');
                var img = item.find('img');
                img.attr('src', 'img/'+getRandomImage())
                $grid.append(item)
            }

            imagesLoaded( $grid[0], function() {
                //alert('')
                // images are ready

                _.delay(function() {
                    new Isotope( '.grid', {
                      columnWidth: 200,
                      itemSelector: '.grid-item'      
                    });
                }, 400);
            
                // $grid.isotope({
                //   columnWidth: 200,
                //   itemSelector: '.grid-item'      
                // });
            } );


            function getRandomImage() {
                var max = imgArray.length;
                var randColor = Math.floor( (Math.random() * max) );
                return imgArray[randColor];
            }

            function getRandomColor() {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++ ) {
                  color += letters[Math.floor(Math.random() * 16)];
                }
                return 'white';
            }
        }

    }]);
});
