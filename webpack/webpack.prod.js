const {merge} = require('webpack-merge');
const path = require('path');
// plugin to remove comment from javascript files
const TerserPlugin = require('terser-webpack-plugin');
// plugin used to copy files from 3rd-party modules in a vendor directory
const CopyPlugin = require("copy-webpack-plugin");
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
        "3dsEuc": './src/3dsEuc.js',
        "3dsHyp": './src/3dsHyp.js',
        "3dsSph": './src/3dsSph.js',
        "3dsS2E": './src/3dsS2E.js',
        "3dsH2E": './src/3dsH2E.js',
        "3dsNil": './src/3dsNil.js',
        "3dsSL2": './src/3dsSL2.js',
        "3dsSol": './src/3dsSol.js',
    },
    output: {
        clean: true,
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
        'webxr-polyfill': 'webxr-polyfill',
        'stats': 'stats',
        'dat.gui': 'dat.gui'
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'node_modules/es-module-shims/dist/es-module-shims.js',
                    to: path.resolve(__dirname, '../dist/vendor')
                },
                {
                    from: 'node_modules/three/build/three.module.js',
                    to: path.resolve(__dirname, '../dist/vendor')
                },
                {
                    from: 'node_modules/three/examples/jsm/libs/stats.module.js',
                    to: path.resolve(__dirname, '../dist/vendor')
                },
                {
                    from: 'node_modules/dat.gui/build/dat.gui.module.js',
                    to: path.resolve(__dirname, '../dist/vendor')
                },
                {
                    from: 'node_modules/dat.gui/build/dat.gui.module.js.map',
                    to: path.resolve(__dirname, '../dist/vendor')
                },
                {
                    from: 'node_modules/webxr-polyfill/build/webxr-polyfill.module.js',
                    to: path.resolve(__dirname, '../dist/vendor')
                },
            ]
        }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {source: 'dist/', destination: path.resolve(__dirname, '../examples/library')},
                    ],
                },
            }
        }),
    ]
});