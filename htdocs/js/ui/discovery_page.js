RCloud.UI.discovery_page = (function() {
    return {
        init: function() {
            require([
                './../../lib/js/imagesloaded',
                './../../lib/js/masonry.pkgd.min'
              ], function(imagesLoaded, Masonry) {
                  'use strict';
                  window.imagesLoaded = imagesLoaded;
                  window.Masonry = Masonry;

                  rcloud.config.get_recent_notebooks().then(function(data){

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

                          var d = {
                              id: currItem[0],
                              time: currItem[1],
                              description: currentNotebook.description,
                              last_commit: new Date(currentNotebook.last_commit).toDateString(),
                              username: currentNotebook.username,
                              num_stars: editor.num_stars(sorted[i][0]),
                              image_url: '/notebook.R/' + currItem[0] + '/thumb.png'
                          };
                          recentTemp.push(d);
                      }

                      // Grab the HTML out of our template tag and pre-compile it.
                      _.templateSettings.variable = 'notebooks';

                      var template = _.template(
                          $("#item_template").html()
                      );

                      $('.grid').html(template(recentTemp));

                      $('.grid').imagesLoaded()
                        .always(function() {

                          new Masonry( '.grid', {
                            itemSelector: '.grid-item'
                          });

                          $('.grid').css('visibility', 'visible');
                          $('#discovery-app').css('visibility', 'visible');
                          $('.loader-icon').css('display', 'none');
                        })
                        .progress(function(imgLoad, image) {
                          //console.log('imgLoad: ', imgLoad);
                          //console.log('image is loaded: ', image.isLoaded);

                          if(!image.isLoaded) {
                            $(image.img).attr('src', './img/missing.png');  
                          }

                          
                        });




                    //  $('.grid img').each(function(i, el) {
                    //    $(el).attr('src', $(el).attr('data-src'));
                    //  });






                      // image error:
                     // $('body').on('error', '.img-responsive', function(){
                     //   $(this).attr('src', './img/missing.png');
                     // });
                      

                  });
            });
        }
    };
})();