module.exports = function(RED) {
	function CombineNode(config) {
		RED.nodes.createNode(this, config);
		this.from = config.from || 'payload';
		this.count = config.count || 0;
		this.combine = [];
		const node = this;
		this.on('input', function(msg) { input(node, msg); });
	}

	RED.nodes.registerType('combine', CombineNode);
}

function input(that, msg) {
	that.combine.push(pluck(msg, that.from));
	if (that.combine.length === (that.count || msg.count)) {
		msg.payload = that.combine;
		that.combine = [];
		that.send(msg);
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
module.exports.pluck = pluck;
