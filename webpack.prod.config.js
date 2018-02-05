var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'public');
var APP_DIR = path.resolve(__dirname, 'src');

var config = {
    entry: ['babel-polyfill', APP_DIR + '/components/App.js'],
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    target: "web",
    node: {
        fs: "empty",
        net: "empty",
        tls: "empty"
    },
    module : {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ],
        loaders : [
            {
                test : /\.js?/,
                include : APP_DIR,
                loader : 'babel-loader'
            }
        ]
    }
};

module.exports = config;