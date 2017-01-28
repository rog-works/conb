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
	replace: '{{{index}}}_$1',
	subject: '(.*)',
	fill: '0000',
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
const gen = mod.index.call(that, msg);
const exs = [
	{ payload: '0000_a', index: 0 },
	{ payload: '0001_b', index: 1 },
	{ payload: '0002_c', index: 2 }
];
for (var ex of exs) {
	asertEquals(gen.next().value, ex);
}
mod.input(that, msg);
