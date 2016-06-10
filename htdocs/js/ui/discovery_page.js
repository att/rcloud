RCloud.UI.discovery_page = (function() {
    var Masonry_;
    var discovery = {
        load_current_metric: function() {
            var current_metric = $('input[name=metric]:checked').val();
            return rcloud.config.get_notebooks_discover(current_metric).then(function(data) {
                var notebook_pairs = _.chain(data.values)
                        .pairs()
                        .filter(function(kv) {
                            return kv[0] != 'r_attributes' && kv[0] != 'r_type' &&
                                !_.isEmpty(editor.get_notebook_info(kv[0]));
                        });
                // assumes we always want descending, among other things
                switch(data.sort) {
                case 'date':
                    notebook_pairs = notebook_pairs
                        .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                        .sortBy(function(kv) { return kv[1] * -1; });
                    break;
                case 'number':
                    notebook_pairs = notebook_pairs.sortBy(function(kv) {
                        return kv[1] * -1;
                    });
                    break;
                }
                notebook_pairs = notebook_pairs.first(20); // bug #2026
                var notebook_data_promises = notebook_pairs
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
                                    image_src: thumb_src,
                                    fork_count: editor.fork_count(current[0])
                                };
                            });
                        })
                        .value();

                Promise.all(notebook_data_promises).then(function(recent_notebooks) {
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
