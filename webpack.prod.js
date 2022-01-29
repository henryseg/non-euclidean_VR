const {merge} = require('webpack-merge');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    experiments: {
        outputModule: true,
        // executeModule: true,
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
        path: path.resolve(__dirname, 'dist/build'),
        filename: '[name].js',
        clean: true,
        library: {
            type: 'module',
        },
        environment: {
             module: true,
        //     dynamicImport: true,
        },
    },
    externals: {
        three: 'three'
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
    plugins: [],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000,
        hot: true
    }
});