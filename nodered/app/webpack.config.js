const webpack = require('webpack');
// const autoprefixer = require('autoprefixer');

module.exports = {
	entry: './src/Index.ts',
	output: {
		path: './public/js/',
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader'
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { modules: true, importLoaders: 1, localIdentName: '[name]__[local]__[hash:base64:5]' } }
					// { loader: 'postcss-loader', options: { plugins: () => [autoprefixer] } },
				]
			},
			{
				test: /\.html$/,
				use: 'raw-loader'
			}
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
