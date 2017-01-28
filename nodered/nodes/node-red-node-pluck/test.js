const mod = require('./index.js');

const msg = {
	payload: {
		hoge: {
			fuga: ['a', 'b', 'c']
		},
		piyo: 123
	}
};
const that = {
	from: 'payload.hoge.fuga',
	to: 'payload',
	send: function(msg) {
		console.log(msg);
	}
};
function asertEquals(actual, expected) {
	if(JSON.stringify(actual) !== JSON.stringify(expected)) {
		console.log(`error!!! ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`);
	}
}

asertEquals(mod.pluck(msg, 'payload.hoge.fuga'), ['a', 'b', 'c']);
mod.setValue(msg, 'payload.piyo', 'abc');
asertEquals(msg.payload.piyo, 'abc');
mod.input(that, msg);
