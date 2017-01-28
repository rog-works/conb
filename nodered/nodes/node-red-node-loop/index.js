module.exports = function(RED) {
	function LoopNode(config) {
		RED.nodes.createNode(this, config);
		this.from = config.from || 'payload';
		this.subject = config.query || '';
		this.replace = config.replace || '';
		this.fill = config.fill || '000';
		const node = this;
		this.on('input', function(msg) { input(node, msg); });
	}

	RED.nodes.registerType('loop', LoopNode);
}

function input(that, msg) {
	var copy = copyMessage(msg);
	const gen = index.call(that, msg);
	var curr = gen.next();
	do {
		var msgData = copyMessage(copy);
		msgData.payload = curr.value.payload;
		msgData.index = curr.value.index;
		that.send(msgData);
		curr = gen.next();
	} while(!curr.done);
}

function copyMessage (msg) {
	const copy = {};
	for (var key of Object.keys(msg)) {
		if (msg.hasOwnProperty(key)) {
			copy[key] = msg[key];
		}
	}
	return copy;
}

function * index(msg) {
	const arr = pluck(msg, this.from);
	const ret = [];
	for (var i in arr) {
		var data = {
			payload: arr[i],
			index: parseInt(i)
		};
		if (this.subject && this.replace) {
			data.payload = arr[i].replace(new RegExp(this.subject), this.replace);
			if (data.payload.indexOf('{{{index}}}') !== -1) {
				data.payload = data.payload.replace('{{{index}}}', `${this.fill}${i}`.slice(-this.fill.length));
			}
		}
		yield data;
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
module.exports.index = index;
module.exports.pluck = pluck;
