RCloud.UI.discovery_page = (function() {
    var Masonry_;
    var discovery = {

        load_current_metric: function() {

            var data,
                current_metric = $('input[name=metric]:checked').val();

            return rcloud.config.get_notebooks_discover(current_metric).then(function(discover_data) {
                data = discover_data;

                // found that for 'popular', it's returning LOTS of items, so reduce to 20 (yuk):
                // bug #2026
                if(Object.keys(data.values).length > 20) {
                    var keys_to_delete = Object.keys(data.values).slice(20);

                    _.each(keys_to_delete, function(k) {
                        delete data.values[k];
                    });
                }

                // get the detailed notebook info;
                return discover.get_notebooks(Object.keys(data.values));

            }).then(function(notebooks) {

                var notebook_pairs = _.chain(data.values)
                        .pairs()
                        .filter(function(kv) {
                            return kv[0] != 'r_attributes' && kv[0] != 'r_type' &&
                                !_.isEmpty(notebooks[kv[0]]);
                        });

                // assumes we always want descending, among other things
                if(data.sort === 'date') {
                    notebook_pairs = notebook_pairs
                        .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                        .sortBy(function(kv) { return kv[1] * -1; });
                } else if(data.sort === 'number') {
                    notebook_pairs = notebook_pairs.sortBy(function(kv) {
                        return kv[1] * -1;
                    });
                }

                var notebook_data_promises = notebook_pairs
                        .map(function(notebook) {
                            var current = notebooks[notebook[0]];
                            return rcloud.get_thumb(notebook[0]).then(function(thumb_src){
                                return {
                                    id: notebook[0],
                                    time: notebook[1],
                                    description: current.description,
                                    last_commit: new Date(current.last_commit).toDateString(),
                                    username: current.username,
                                    num_stars: current.stars,
                                    image_src: thumb_src || './img/missing.png',
                                    fork_count: current.forks
                                };
                            });
                        })
                        .value();

                return Promise.all(notebook_data_promises).then(function(recent_notebooks) {
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
