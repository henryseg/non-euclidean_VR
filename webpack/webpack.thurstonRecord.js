const {merge} = require('webpack-merge');
const path = require('path');
// plugin to remove comment from javascript files
const TerserPlugin = require('terser-webpack-plugin');
// plugin to copy the distribution in the examples directory after it has been built
const FileManagerPlugin = require("filemanager-webpack-plugin");

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    experiments: {
        outputModule: true,
    },
    optimization: {
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

    entry: {
        "thurstonRecord": './src/thurston/thurstonRecord/ThurstonRecord.js',
    },
    output: {
        // clean: true,
        path: path.resolve(__dirname, '../dist/3ds'),
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
        '3ds': '3ds',
        'stats': 'stats',
        'dat.gui': 'dat.gui'
    },

    plugins: [

        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [{
                        source: 'dist/3ds/thurstonRecord.js',
                        destination: path.resolve(__dirname, '../examples/library/3ds/thurstonRecord.js')
                    }],
                },
            }
        }),
    ]
});