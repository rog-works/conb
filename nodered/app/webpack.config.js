const webpack = require('webpack');
module.exports = {
	entry: './src/Index.ts',
	output: {
		path: './public/js/',
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.ts', '.js', '.html']
	},
	module: {
		loaders: [
			{ test: /\.ts$/, loader: 'ts-loader' },
			{ test: /\.html$/, loader: 'raw-loader' }
		]
	},
	plugins: [
		// new webpack.optimize.UglifyJsPlugin()
	],
	watchOptions: {
		poll: 500
	},
	devtool: 'source-map'
};
