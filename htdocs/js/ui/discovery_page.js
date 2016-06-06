RCloud.UI.discovery_page = (function() {
    var Masonry_;
    var discovery = {
        load_current_metric: function() {
            var current_metric = $('input[name=metric]:checked').val();
            return rcloud.config.get_notebooks_discover(current_metric).then(function(data){
                var recent_notebooks_ = _.chain(data)
                        .pairs()
                        .filter(function(kv) {
                            return kv[0] != 'r_attributes' && kv[0] != 'r_type' && !_.isEmpty(editor.get_notebook_info(kv[0])) ;
                        })
                        .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                        .sortBy(function(kv) { return kv[1] * -1; })
                        .first(20)
                        .map(function(notebook) {
                            var current = editor.get_notebook_info(notebook[0]);
                            return rcloud.get_thumb(notebook[0]).then(function(thumb_src){
                                return {
                                    id: notebook[0],
                                    time: notebook[1],
                                    description: current.description,
                                    last_commit: new Date(current.last_commit).toDateString(),
                                    username: current.username,
                                    num_stars: editor.num_stars(current[0]),
                                    image_src: "data:image/png;base64," + thumb_src
                                };
                            });
                        })
                        .value();

                Promise.all(recent_notebooks_).then(function(recent_notebooks) {
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
                            new Masonry_( '.grid', {
                                itemSelector: '.grid-item'
                            });

                            $('#progress').fadeOut(200, function() {
                                $('.navbar').fadeIn(200, function() {
                                    $('#discovery-app').css('visibility', 'visible');
                                    $('body').addClass('loaded');
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
        },
        init: function() {
            return new Promise(function(resolve, reject) {
                require([
                    'imagesloaded',
                    'masonry.pkgd.min'
                ], function(imagesLoaded, Masonry) {
                    'use strict';

                    Masonry_ = Masonry;

                    $('input[name=metric]').on('change', function() {
                        discovery.load_current_metric();
                    });

                    resolve(discovery.load_current_metric());
                }, reject);
            });
        }
    };
    return discovery;
})();
