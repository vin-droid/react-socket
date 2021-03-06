
const path = require('path');
module.exports = {
		entry: './src/index.js',
	  output: {
	    filename: 'bundle.js',
	    path: path.resolve(__dirname, '/')
	  },
	  mode: 'development',
    devtool: 'source-maps',
    module: {
    		rules: [
		      {
		        test: /\.js$/,
		        exclude: /node_modules/,
		        use: {
		          loader: "babel-loader",
		          query: {
	                    presets: [
	                        'es2015', 'react'
	                    ],
	                    plugins: ['transform-class-properties']
	                }
		        }
					}, {
						test: /\.css$/,
						loader: 'style-loader'
					}, {
						test: /\.css$/,
						loader: 'css-loader',
						query: {
							modules: true,
							localIdentName: '[name]__[local]___[hash:base64:5]'
						}
					}
    		]
  	}
}