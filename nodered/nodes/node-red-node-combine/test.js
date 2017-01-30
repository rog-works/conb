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
	count: 2,
	combine: [],
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
[1,2,3,4,5,6,7].forEach((value) => { console.log(value); mod.input(that, { payload: value }); });
