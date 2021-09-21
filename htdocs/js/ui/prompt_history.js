RCloud.UI.prompt_history = function() {
    var entries_ = [], alt_ = [];
    var curr_ = 0;
    function curr_cmd() {
        return alt_[curr_] || (curr_<entries_.length ? entries_[curr_] : "");
    }
    var prefix_ = null;
    var result = {
        init: function(save_name) {
            if(save_name) {
                prefix_ = "rcloud.history." + save_name + ".";
                var i = 0;
                entries_ = [];
                alt_ = [];
                var last_lang = window.localStorage["last_cell_lang"] || "R";
                while(1) {
                    var cmd = window.localStorage[prefix_+i],
                        cmda = window.localStorage[prefix_+i+".alt"];
                    if(cmda !== undefined)
                        alt_[i] = cmda;
                    if(cmd === undefined)
                        break;
                    entries_.push(cmd);
                    ++i;
                }
                curr_ = entries_.length;
            }
            else prefix_ = null;
            return {"cmd":curr_cmd(),"lang":last_lang};
        },
        add_entry: function(cmd) {
            if(cmd==="") return;
            alt_[entries_.length] = null;
            entries_.push(cmd);
            alt_[curr_] = null;
            curr_ = entries_.length;
            if(prefix_)
                window.localStorage[prefix_+(curr_-1)] = cmd;
        },
        has_last: function() {
            return curr_>0;
        },
        last: function() {
            if(curr_>0) --curr_;
            return curr_cmd();
        },
        has_next: function() {
            return curr_<entries_.length;
        },
        next: function() {
            if(curr_<entries_.length) ++curr_;
            return curr_cmd();
        },
        change: function(cmd) {
            alt_[curr_] = cmd;
            if(prefix_)
                window.localStorage[prefix_+curr_+".alt"] = cmd;
        }
    };
    return result;
};
