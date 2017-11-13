RCloud.UI.share_button = (function() {
    var extension_;
    var default_item_ = null;
    
    function set_view_type(title) {
        title = (title && extension_.get(title)) ? title : default_item_;
        if(!title)
            return Promise.reject(new Error('share button view types set up wrong'));
        return rcloud.set_notebook_property(shell.gistname(), "view-type", title);
    }
    
    function get_view_type_name(gistname) {
      return rcloud.get_notebook_property(gistname, "view-type").then(function(title) {
              title = (title && extension_.get(title)) ? title : default_item_;
              if(!title)
                  return Promise.reject(new Error('share button view types set up wrong'));
              return title;
      });
    }
    
    function get_view_type(gistname) {
      return get_view_type_name(gistname).then(function(title) {
              var view_type = extension_.get(title);
              return view_type;
      });
    }

    function resolve_view_url(gistname, version) {
          var notebook_options = null;
          if(version) {
            fetch_version = rcloud.get_tag_by_version(gistname, version)
            .then(function(tag) {
              var opts = {notebook: gistname,
                    version: x};
                if(tag) {
                    opts.tag = tag;
                }
                return opts;
            });
          } else {
            notebook_options = Promise.resolve(undefined).then(function(x) {
              return { notebook: gistname };
            });
          }
          var join = Promise.join;
          
          return join(notebook_options, get_view_type(gistname), 
              function(opts, view_type) {
                var page = view_type.page;
                opts.do_path = view_type.do_path;
                return ui_utils.make_url(page, opts);
          });
        }
        
    function highlight(title) {
      if(title) {
        $("#view-type li a").css("font-weight", function() {
            return $(this).text() === title ? "bold" : "normal";
        });
      }        
    }
        
    return {
        init: function() {
            extension_ = RCloud.extension.create({
                defaults: {
                    create: function() {
                        var that = this;
                        return {
                            title: that.key,
                            handler: function() {
                                set_view_type(that.key).then(function() {
                                    highlight(that.key);
                                }).then(function() {
                                  return resolve_view_url(shell.gistname(), shell.version()).then(function(url) {
                                    var shareable_link = RCloud.UI.navbar.control('shareable_link');
                                    shareable_link.set_url(url);
                                    shareable_link.open();
                                  });
                                });
                            }
                        };
                    }
                }
            });
            this.add({
                'view.html': {
                    sort: 1000,
                    page: 'view.html'
                },
                'notebook.R': {
                    sort: 2000,
                    page: 'notebook.R',
                    do_path: true
                },
                'mini.html': {
                    sort: 3000,
                    page: 'mini.html'
                }
            });
            return this;
        },
        add: function(view_types) {
            if(extension_)
                extension_.add(view_types);
            return this;
        },
        remove: function(view_type) {
            if(extension_)
                extension_.remove(command_name);
            return this;
        },
        load: function() {
            var that = this;
            var items = extension_.create('all').array;
            default_item_ = items.length ? items[0].title : null;
            RCloud.UI.navbar.control('shareable_link').set_view_types(items);
            return this;
        },
        update_link: function() {
          return resolve_view_url(shell.gistname(), shell.version()).then(function(url) {
                                  var shareable_link = RCloud.UI.navbar.control('shareable_link');
                                  shareable_link.set_url(url);
                                }).then(function() {
                                  return get_view_type_name(shell.gistname()).then(function(title) {
                                    highlight(title);
                                })});
        },
        resolve_view_link: function(gistname, version) {
          return resolve_view_url(gistname, version);
        }
    };
})();
