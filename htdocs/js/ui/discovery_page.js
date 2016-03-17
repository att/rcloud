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

                      var recent_notebooks = _.chain(data)
                      .pairs()
                      .filter(function(kv) {
                          return kv[0] != 'r_attributes' && kv[0] != 'r_type' && !_.isEmpty(editor.get_notebook_info(kv[0])) ;
                      })
                      .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                      .sortBy(function(kv) { return kv[1] * -1; })
                      .first(20)
                      .map(function(notebook) {
                        var current = editor.get_notebook_info(notebook[0]);
                        return {
                          id: notebook[0],
                          time: notebook[1],
                          description: current.description,
                          last_commit: new Date(current.last_commit).toDateString(),
                          username: current.username,
                          num_stars: editor.num_stars(current[0]),
                          image_url: 'notebook.R/' + notebook[0] + '/thumb.png'
                        }
                      })
                      .value();

                      $('progress').attr({
                        max: recent_notebooks.length
                      });

                      var template = _.template(
                          $("#item_template").html()
                      );

                      $('.grid').html(template({
                        notebooks: recent_notebooks
                      })).imagesLoaded()
                        .always(function() {

                          new Masonry( '.grid', {
                            itemSelector: '.grid-item'
                          });

                          //$('body').addClass('loaded');

                          $('#progress').fadeOut(200, function() {
                            $('.navbar').fadeIn(200, function() {
                              $('#discovery-app').css('visibility', 'visible');
                            });
                          });
                          
                        })
                        .progress(function(imgLoad, image) {
                          if(!image.isLoaded) {
                            $(image.img).attr('src', './img/missing.png');  
                          }

                          var new_value = +$('progress').attr('value') + 1;

                          $('progress').attr({
                            value: new_value
                          });

                        });
                  });
            });
        }
    };
})();