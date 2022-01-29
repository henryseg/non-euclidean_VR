const {merge} = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    cache: false,
    devtool: 'inline-source-map',
    entry: './src/dev/dev.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'dev.js',
        clean: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            filename: 'index.html',
            template: './src/dev/index.html',
        })
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000,
        hot: true,
        open: false,
    }
});
