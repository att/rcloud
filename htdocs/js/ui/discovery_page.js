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

            var data;
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

                var tidy_path = function(notebook_description) {
                    if(notebook_description.lastIndexOf('/') == -1) {
                        return notebook_description;
                    } else {
                        return notebook_description.substring(notebook_description.lastIndexOf('/') + 1)
                    }
                };

                var notebook_data_promises = notebook_pairs
                        .map(function(notebook) {
                            var current = notebooks[notebook[0]];
                            return rcloud.discovery.get_thumb(notebook[0]).then(function(thumb_src){
                                return {
                                    id: notebook[0],
                                    time: notebook[1],
                                    description: tidy_path(current.description),
                                    last_commit: new Date(current.last_commit).toDateString(),
                                    page: anonymous ? 'view.html' : 'edit.html',
                                    username: current.username,
                                    stars: current.stars,
                                    star_icon: !_.isUndefined(current.is_starred_by_me) && current.is_starred_by_me ? 'icon-star' : 'icon-star-empty',
                                    forks: current.forks,                                    
                                    image_src: thumb_src || './img/missing.png'
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
