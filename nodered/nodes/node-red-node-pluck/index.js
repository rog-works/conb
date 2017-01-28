module.exports = function(RED) {
	function PluckNode(config) {
		RED.nodes.createNode(this, config);
		this.from = config.from || 'payload';
		this.to = config.to || 'payload';
		var node = this;
		this.on('input', function(msg) { input(node, msg); });
	}

	RED.nodes.registerType('pluck', PluckNode);
}

function input(that, msg) {
	const from = pluck(msg, that.from);
	if (!from) {
		that.send(null);
	} else {
		setValue(msg, that.to, from);
		that.send(msg);
	}
}

function setValue(obj, query, value) {
	var curr = obj;
	var prev = null;
	var currKey = '';
	const routes = query.split('.');
	for (var key of routes) {
		if (curr && (typeof curr === 'object')) {
			if (!(key in curr)) {
				curr[key] = {};
			}
			prev = curr;
			currKey = key;
			curr = curr[key];
		} else {
			break;
		}
	}
	if (prev && currKey) {
		prev[currKey] = value;
	}
}

function pluck(obj, query) {
	var curr = obj;
	const routes = query.split('.');
	for (var key of routes) {
		if (curr && (typeof curr === 'object') && (key in curr)) {
			curr = curr[key];
		} else {
			break;
		}
	}
	return curr === obj ? null : curr;
}

module.exports.input = input;
module.exports.setValue = setValue;
module.exports.pluck = pluck;