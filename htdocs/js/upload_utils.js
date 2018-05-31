(function() {
    function upload_opts(opts) {
        if(_.isBoolean(opts) || _.isUndefined(opts))
            opts = {force: !!opts};
        else if(!_.isObject(opts))
            throw new Error("didn't understand options " + opts);
        opts = $.extend({
            force: false
        }, opts);
        if(!opts.files)
            opts.files = opts.$file ? opts.$file[0].files : [];
        return opts;
    }

    function text_or_binary_reader() {
        return Promise.promisify(function(file, callback) {
            var fr = new FileReader();
            var bytes_read = 0;

            fr.onload = function(e) {
                // send across as ArrayBuffer/raw vector. server will decide if it's string or binary content
                callback(null, fr.result);
            };
            fr.onerror = function(e) {
                callback(fr.error, null);
            };
            fr.readAsArrayBuffer(file.slice(0, file.size));
        });
    }

    RCloud.upload_assets = function(options, react) {
        react = react || {};
        options = upload_opts(options);
        function upload_asset(filename, content) {
            var replacing = shell.notebook.model.get_asset(filename);
            var promise_controller;
            if(replacing) {
                if(react.replace)
                    react.replace(filename);
                replacing.content(content);
                promise_controller = shell.notebook.controller.update_asset(replacing)
                    .return(replacing.controller);
            }
            else {
                if(react.add)
                    react.add(filename);
                promise_controller = shell.notebook.controller.append_asset(content, filename)
                    .then(function() {
                        return shell.notebook.model.get_asset(filename).controller;
                    });
            }
            return promise_controller.then(function(controller) {
                controller.select();
            });
        }

        var use_filenames = false, replace_filenames = {};
        if(options.filenames && options.files.length === options.filenames.length) {
            use_filenames = true;
            for(var loop = 0; loop < options.filenames.length; loop++) {
                replace_filenames[options.files[loop].name] = options.filenames[loop];
            }
        }

        return RCloud.utils.promise_sequence(
            options.files,
            function(file) {
                if(file.size > 2.5e6)
                    return Promise.reject(new Error('File ' + file.name + ' rejected: maximum asset size is 2.5MB'));
                return text_or_binary_reader()(file)
                    .then(function(content) {
                        if(_.isString(content) && Notebook.empty_for_github(content))
                            throw new Error("empty");
                        return upload_asset(use_filenames ? replace_filenames[file.name] : file.name, content);
                    });
            });
    };

    function binary_upload(upload_ocaps, react) {
        return Promise.promisify(function(file, is_replace, callback) {
            var fr = new FileReader();
            var chunk_size = 1024*128;
            var f_size=file.size;
            var cur_pos=0;
            var bytes_read = 0;
            if(react.start)
                react.start(file.name);
            //initiate the first chunk, and then another, and then another ...
            // ...while waiting for one to complete before reading another
            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
            fr.onload = function(e) {
                if(react.progress)
                    react.progress(bytes_read, f_size);
                var promise;
                if (e.target.result.byteLength > 0) {
                    var bytes = new Uint8Array(e.target.result);
                    promise = upload_ocaps.writeAsync(bytes.buffer)
                        .then(function() {
                            bytes_read += e.target.result.byteLength;
                            cur_pos += chunk_size;
                            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                        });
                } else {
                    promise = upload_ocaps.closeAsync()
                        .then(function() {
                            if(react.done)
                                react.done(is_replace, file.name);
                            callback(null, true);
                        });
                }
                promise.catch(function(err) {
                    callback(err, null);
                });
            };
        });
    }

    RCloud.upload_files = function(options, react) {
        var upload_ocaps = options.upload_ocaps || rcloud._ocaps.file_upload;
        react = react || {};
        options = upload_opts(options);
        var upload = binary_upload(upload_ocaps, react);
        function upload_file(path, file) {
            var upload_name = path + '/' + file.name;
            return upload_ocaps.createAsync(upload_name, options.force)
                .catch(function(err) {
                    if(react.confirm_replace && /exists/.test(err.message)) {
                        return react.confirm_replace(file.name)
                            .then(function(confirm) {
                                return confirm ?
                                    upload_ocaps.createAsync(upload_name, true)
                                    .return("overwrite") :
                                    Promise.resolve(false);
                            });
                    }
                    else throw err;
                })
                .then(function(whether) {
                    return whether ? upload(file, whether==="overwrite") : Promise.resolve(undefined);
                });
        }

        if(!(window.File && window.FileReader && window.FileList && window.Blob))
            return Promise.reject(new Error("File API not supported by browser."));
        else {
            if(_.isUndefined(options.files) || !options.files.length)
                return Promise.reject(new Error("No files selected!"));
            else {
                /*FIXME add logged in user */
                return upload_ocaps.upload_pathAsync()
                    .then(function(path) {
                        return RCloud.utils.promise_sequence(options.files, upload_file.bind(null, path));
                    });
            }
        }
    };
})();
