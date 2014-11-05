// https://github.com/mikeycgto/jquery.whiny.js/blob/master/jquery.whiny.js

(function(){
	var original = jQuery.fn.init;

	jQuery.fn.init = function(selector, context, rootjQuery){
	 	var obj = new original(selector, context, rootjQuery);

		if (obj.selector && obj.length === 0 && console && console.warn)
			console.warn("jQuery was called with a selector of '" + selector + "' and returned an empty object");

		return obj;
	};
})();
