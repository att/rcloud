var editor = {
    widget: undefined,
    file_tree_model: undefined,
    create_file_tree_widget: function() { 
        var that = this;
        var $tree = $("#editor-file-tree");
        function onCreateLiHandler(node, $li) {
            node = that.file_tree_model[node.id];
            if (node) {
                $li.find('.title').after('<span style="float: right">' + node.mtime + '</span>');
            }
        }
        $tree.tree({
            autoOpen: 1,
            onCreateLi: onCreateLiHandler
        });
        $tree.bind(
            'tree.click', function(event) {
                if (event.node.id === "newfile") {
                    shell.new_file();
                } else if (!_.isUndefined(event.node.file_type)) {
                    shell.serialize_state(function() {
                        shell.load_from_file(event.node.user_name, event.node.file_name);
                    });
                } else {
                    shell.load_from_file(event.node.user_name, event.node.file_name);
                }
            }
        );
    },
    populate_file_list: function() {
        var that = this;
        rcloud.get_all_user_filenames(function(data) {
            var this_user = rcloud.username();
            var result = [];
            that.file_tree_model = {};
            for (var i=0; i<data.length; ++i) {
                var dirname = data[i][0];
                var files_data = data[i][1];
                
                var file_nodes = _.map(files_data, function(file_data) {
                    var name = file_data[0];
                    var mtime = file_data[1];
                    var result = { 
                        label: name,
                        mtime: mtime,
                        file_name: name,
                        user_name: dirname,
                        file_type: (this_user === dirname) ? "w" : "r",
                        id: '/' + dirname + '/' + name 
                    };
                    that.file_tree_model[result.id] = result;
                    return result;
                });
                if (dirname === this_user) {
                    file_nodes.push({
                        label: "[New File]",
                        id: "newfile"
                    });
                };
                var node = { 
                    label: dirname,
                    id: '/' + dirname,
                    children: file_nodes 
                };
                result.push(node);
            }
            var tree_data = [ { 
                label: '/',
                id: '/',
                children: result 
            } ];
            var $tree = $("#editor-file-tree");
            $tree.tree("loadData", tree_data); 
            var folder = $tree.tree('getNodeById', "/" + rcloud.username());
            $(folder.element).parent().prepend(folder.element);
            $tree.tree('openNode', folder);
        });
    },
    init: function() {
        $("#input-text-source-results-title").css("display", "none");
        $("#input-text-history-results-title").css("display", "none");
        var that = this;
        this.create_file_tree_widget();
        this.populate_file_list();
        var old_text = "";
        window.setInterval(function() {
            var new_text = $("#input-text-search").val();
            if (new_text !== old_text) {
                old_text = new_text;
                that.search(new_text);
            }
        }, 500);
    },
    save_file: function(user, filename, k) {
        shell.save_to_file(user, filename, k);
    },
    load_file: function(user, filename, k) {
        var that = this;
        shell.load_from_file(user, filename);
    },
    search: function(search_string) {
        var that = this;
        function split_source_search_lines(line) {
            var r = /:/g;
            var r2 = /\/([^/]+)\/([^/]+)/;
            var result = [];
            while (r.exec(line) !== null) {
                result.push(r.lastIndex);
                if (result.length === 2) {
                    var path = line.substring(0, result[0]-1);
                    var t = path.match(r2);
                    return [t[1], t[2],
                            line.substring(result[0], result[1]-1),
                            line.substring(result[1])];
                }
            }
            throw "shouldn't get here";
        };
        function split_history_search_lines(line) {
            var t = line.indexOf(':');
            var r = /\|/g;
            var line_number = line.substring(0, t);
            line = line.substring(t+1);
            var result = [];
            while (r.exec(line) !== null) {
                result.push(r.lastIndex);
                if (result.length === 2) {
                    return [line_number, 
                            line.substring(0, result[0]-1),
                            line.substring(result[0], result[1]-1),
                            line.substring(result[1])];
                }
            }
            throw "shouldn't get here";
        };

        function update_source_search(result) {
            d3.select("#input-text-source-results-title")
                .style("display", (result !== null && result.length >= 1)?null:"none");
            var data = _.map(result, split_source_search_lines);
            d3.select("#input-text-source-results-table")
                .selectAll("tr").remove();
            var td_classes = ["user", "filename", "linenumber", "loc"];
            d3.select("#input-text-source-results-table")
                .selectAll("tr")
                .data(data)
                .enter().append("tr")
                        .selectAll("td")
                        .data(function(d,i) { 
                            return _.map(d, function(v, k) {
                                return [v, i];
                            });
                        })
                        .enter()
                        .append("td")
                        .text(function(d, i) { 
                            if (i === 2) { 
                                return d[0] + ":"; 
                            } else {
                                return d[0];
                            }
                        })
                        .attr("class", function(d, i) {
                            var j = d[1];
                            d = d[0];
                            if (j === 0 || data[j-1][i] !== d)
                                return "text-result-table-" + td_classes[i];
                            else
                                return "text-result-table-same-" + td_classes[i];
                        })
                        .on("click", function(d, i) {
                            if (i !== 1 && i !== 3)
                                return;
                            var j = d[1];
                            var user = data[j][0], filename = data[j][1];
                            that.load_file(user, filename);
                        })
                ;
        };
        function update_history_search(result) {
            d3.select("#input-text-history-results-title")
                .style("display", (result !== null && result.length >= 1)?null:"none");
            var data = _.map(result, split_history_search_lines);
            d3.select("#input-text-history-results-table")
                .selectAll("tr").remove();
            var td_classes = ["date", "user", "loc"];
            d3.select("#input-text-history-results-table")
                .selectAll("tr")
                .data(data)
                .enter().append("tr")
                        .selectAll("td")
                        .data(function(d,i) { 
                            return _.map(d.slice(1), function(v, k) {
                                return [v, i];
                            });
                        })
                        .enter()
                        .append("td")
                        .text(function(d) { 
                            return d[0];
                        })
                        .attr("class", function(d, i) {
                            var j = d[1];
                            d = d[0];
                            if (j === 0 || data[j-1][i+1] !== d)
                                return "text-result-table-" + td_classes[i];
                            else
                                return "text-result-table-same-" + td_classes[i];
                        })
                        .on("click", function(d, i) {
                        })
                ;
        };
        rcloud.search(search_string, function(result) {
            update_source_search(result[0]);
            update_history_search(result[1]);
        });
    }
};
