RCloud.UI.discovery_page = (function() {

    var Masonry_;

    var metric_handler = function() {

        var $el_ = $('#metric-type');
        var types_ = ['recently.modified', 'most.popular'];
        var default_type_ = types_[0];

        function set_active_link(metric_type) {
            $el_.find('li').removeClass('active');
            $el_.find('a[data-type="' + metric_type + '"]').parent().addClass('active');
        }

        function get_links() {
            return $el_.find('a');
        }

        function initialise_links() {
            _.each(get_links(), function(link) {
                // give the links proper URLs
                $(link).attr('href', '?metric=' + $(link).attr('data-type'));
            });
        }

        var updateQueryStringParam = function (key, value) {
            var baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
                param = '?' + key + '=' + value;

            window.history.pushState({ path : baseUrl + param  }, '', baseUrl + param);
        };

        var get_qs_metric = function() {
            var qs_metric = RCloud.utils.get_url_parameter('metric');

            return types_.indexOf(qs_metric) > -1 ? qs_metric : default_type_;
        };

        return {
            init: function(opts) {

                initialise_links();

                get_links().click(function(e) {

                    e.preventDefault();

                    var metric_type = $(this).attr('data-type');

                    set_active_link(metric_type);

                    updateQueryStringParam('metric', metric_type);

                    if(_.isFunction(opts.change)) {
                        opts.change(metric_type);
                    }
                });

                window.addEventListener('popstate', function(e) {
                    if(_.isFunction(opts.change)) {
                        var metric_type = get_qs_metric();
                        set_active_link(metric_type);
                        opts.change(metric_type);
                    }
                });

                var qs_metric = get_qs_metric();
                set_active_link(qs_metric);

                if(_.isFunction(opts.oncomplete)) {
                    opts.oncomplete(qs_metric);
                }
            }
        };
    };

    var discovery = {

        load_current_metric: function(current_metric) {

            var data, missing_img = 'data:image/png;base64,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';
            current_metric = current_metric || 'recently.modified';


            var anonymous = !rcloud.username();

            return rcloud.discovery.get_notebooks(current_metric).then(function(discover_data) {
                data = discover_data;

                // temporary
                if(Object.keys(data.values).length > 100) {
                    var keys_to_delete = Object.keys(data.values).slice(100);

                    _.each(keys_to_delete, function(k) {
                        delete data.values[k];
                    });
                }

                // get the detailed notebook info;
                return RCloud.discovery_model.get_notebooks(anonymous, Object.keys(data.values));

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

                var get_path_and_name = function(notebook_description) {
                    if(!notebook_description || notebook_description.lastIndexOf('/') == -1) {
                        return {
                            path: undefined,
                            name: notebook_description
                        };
                    } else {
                        return {
                            path: notebook_description.substring(0, notebook_description.lastIndexOf('/')),
                            name: notebook_description.substring(notebook_description.lastIndexOf('/') + 1)
                        }
                    }
                }

                var notebook_data_promises = notebook_pairs
                        .map(function(notebook) {
                            var current = notebooks[notebook[0]];
                            var desc = get_path_and_name(current.description);
                            return rcloud.discovery.get_thumb(notebook[0]).then(function(thumb_src){
                                return {
                                    id: notebook[0],
                                    time: notebook[1],
                                    description: desc.name,
                                    folder_path: desc.path,
                                    last_commit: new Date(current.last_commit).toDateString(),
                                    page: anonymous ? 'view.html' : 'edit.html',
                                    username: current.username,
                                    stars: current.stars,
                                    star_icon: !_.isUndefined(current.is_starred_by_me) && current.is_starred_by_me ? 'icon-star' : 'icon-star-empty',
                                    forks: current.forks,                                    
                                    image_src: thumb_src || missing_img
                                };
                            });
                        })
                        .value();

                return Promise.all(notebook_data_promises).then(function(recent_notebooks) {

                    var template = _.template(
                        $("#item_template").html()
                    );

                    $('.grid').html(template({
                        notebooks: recent_notebooks
                    })).imagesLoaded(function() {

                            new Masonry_( '.grid', {
                                itemSelector: '.grid-item',
                                transitionDuration: 0
                            });

                            if($('#progress').is(':visible')) {
                                $('#progress').fadeOut(200, function() {
                                    $('.navbar').fadeIn(200, function() {
                                        $('#discovery-app').css('visibility', 'visible');
                                        $('body').addClass('loaded');
                                    });
                                });
                            }
                        });
                });
            });
        },

        init: function() {
            return new Promise(function(resolve, reject) {
                require([
                    'imagesloaded.pkgd.min',
                    'masonry.pkgd.min'
                ], function(imagesLoaded, Masonry) {
                    'use strict';

                    Masonry_ = Masonry;

                    var metric = new metric_handler();

                    metric.init({
                        change: function(metric) {
                            discovery.load_current_metric(metric);
                        },
                        oncomplete: function(metric) {
                            resolve(discovery.load_current_metric(metric));
                        }
                    });

                }, reject);
            });
        }
    };

    return discovery;
})();
