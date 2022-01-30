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
    entry: {
        thurstonEuc: './src/thurstonEuc.js',
        thurstonHyp: './src/thurstonHyp.js',
        thurstonSph: './src/thurstonSph.js',
        thurstonS2E: './src/thurstonS2E.js',
        thurstonH2E: './src/thurstonH2E.js',
        thurstonNil: './src/thurstonNil.js',
        thurstonSL2: './src/thurstonSL2.js',
        thurstonSol: './src/thurstonSol.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist/build/thurston'),
        filename: '[name].js',
        clean: true,
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
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'node_modules/es-module-shims/dist/es-module-shims.js',
                    to: path.resolve(__dirname, 'dist/build/vendor')
                },
                {
                    from: 'node_modules/three/build/three.module.js',
                    to: path.resolve(__dirname, 'dist/build/vendor')
                },
                {
                    from: 'node_modules/three/examples/jsm/libs/stats.module.js',
                    to: path.resolve(__dirname, 'dist/build/vendor')
                },
                {
                    from: 'node_modules/dat.gui/build/dat.gui.module.js',
                    to: path.resolve(__dirname, 'dist/build/vendor')
                },
                {
                    from: 'node_modules/webxr-polyfill/build/webxr-polyfill.module.js',
                    to: path.resolve(__dirname, 'dist/build/vendor')
                }
            ]
        }),
    ]
});