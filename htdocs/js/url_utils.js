var url_utils = (function() {
  return {
      getQueryParams: function () 
      {
        return (function (a) {
              if (a == "") return {};
              let b = {};
              for (let i = 0; i < a.length; ++i) {
                  let p = a[i].split('=', 2);
                  if (p.length == 1)
                    b[p[0]] = "";
                  else
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
              }
              return b;
              })(window.location.search.substr(1).split('&'));
      },
      
      updateHistory: function (params, state) {
        let base = this.getBase();
        let segments = this.getPathSegments();
        let url = this.generateUrlString(base, segments, params);
        let historyState = history.state;
        
        if (!state) {
           window.history.pushState(null, null, url);
        } if (!_.isEqual(state, historyState)) {
           window.history.pushState(state, null, url);
        } else {
           window.history.replaceState(state, null, url);
        }
        return state;
      },
      
      generateUrlString: function (base, segments, params) 
      {
        let sep = '';
        segments = segments || [];
        params = params || {};
        if (!base.endsWith('/') && segments && segments.length > 0) {
          sep = '/';
        }
        let parts = [];
        for (let k in params) {
          if (params[k] !== undefined && params[k] !== null) {
            parts.push(k + '=' + encodeURIComponent(params[k]));
          }
        }

        return base + sep + _.filter(segments, (s) => s !== '').join('/') + '?' + parts.join('&');
      },
      
      getBase: function() 
      {
        return window.location.protocol + '//' + window.location.host;
      },
      
      getPathSegments: function() 
      {
        return _.filter(window.location.pathname.split('/'), (s) => s !== ''); 
      }
  };
})();
