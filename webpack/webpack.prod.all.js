const {merge} = require('webpack-merge');
const path = require('path');
// plugin to remove comment from javascript files
const TerserPlugin = require('terser-webpack-plugin');
// plugin used to copy files from 3dparty modules in a vendor directory
const CopyPlugin = require("copy-webpack-plugin");
// plugin to copy the distribution in the examples directory after it has been built
const FileManagerPlugin = require("filemanager-webpack-plugin");

const common = require('./webpack.prod.gen.js');

module.exports = merge(common, {
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
        clean: true,
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