var slice = Array.prototype.slice;

module.exports = function create() {
	var root = {};
	return {
		observe: function(path, evt, cb, ctx) {
			if (typeof evt !== 'string') {
				return add(root, path, '*', evt, cb, 0);
			} else {
				return add(root, path, evt, cb, ctx, 0);	
			}
		},
		emit: function(path, evt) {
			args = slice.call(arguments, 2);
			return fire(root, path, evt, args, 0);
		}
	};
};

function makeRemover(lst, item, count) {
	var removed = false;
	return function() {
		if (removed) return;
		removed = true;
		var ix = lst.indexOf(item);
		if (ix >= 0) {
			lst.splice(ix, count);
		}
	};
}

function dispatch(handlers, evt, args) {
	_dispatch('*');
	_dispatch(evt);

	var cix;
	while ((cix = evt.lastIndexOf(':')) >= 0) {
		evt = evt.substring(0, cix);
		_dispatch(evt);
	}

	function _dispatch(key) {
		var list = handlers[key];
		if (!list) return;
		for (var i = list.length - 2; i >= 0; i -= 2) {
			list[i].apply(list[i+1], args);
		}
	}
}

function add(node, path, evt, cb, ctx, ix) {
	if (ix === path.length) {
		var allEvents = node.$eventHandlers || (node.$eventHandlers = {});
		var watchers = allEvents[evt] || (allEvents[evt] = []);
		watchers.push(cb, ctx);
		return makeRemover(watchers, cb, 2);
	} else {
		var child = node[path[ix]] || (node[path[ix]] = {});
		return add(child, path, evt, cb, ctx, ix + 1);
	}
}

function fire(node, path, evt, args, ix) {
	if (!node) return;
	if (ix === path.length) {
		var allEvents = node.$eventHandlers;
		if (allEvents) {
			dispatch(allEvents, evt, args);
		}
	} else {
		fire(node[path[ix]], path, evt, args, ix + 1);
		if (node['?']) {
			fire(node['?'], path, evt, args, ix + 1);
		}
		if (node['*']) {
			fire(node, path, evt, args, ix + 1);
			fire(node['*'], path, evt, args, ix + 1);
		}
	}
}
