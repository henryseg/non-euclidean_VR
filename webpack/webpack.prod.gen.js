const {merge} = require('webpack-merge');
const path = require('path');
// plugin to remove comment from javascript files
const TerserPlugin = require('terser-webpack-plugin');
// plugin used to copy files from 3dparty modules in a vendor directory
const CopyPlugin = require("copy-webpack-plugin");

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    experiments: {
        outputModule: true,
    },
    output: {
        path: path.resolve(__dirname, '../dist/thurston'),
        filename: '[name].js',
        library: {
            type: 'module',
        },
        environment: {
             module: true,
        },
    },
    externals: {
        'three': 'three',
        'webxr-polyfill': 'webxr-polyfill',
        'stats': 'stats',
        'dat.gui': 'dat.gui'
    },
    optimization: {
        // splitChunks: {
        //     chunks: 'all',
        // },
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
});