const path = require('path');

module.exports = {
    cache: false,
    experiments: {
        outputModule: true,
        executeModule: true,
    },
    entry: {
        thurstonEuc: './src/thurstonEuc.js',
        thurstonHyp: './src/thurstonHyp.js',
        thurstonSph: './src/thurstonSph.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist/build'),
        filename: '[name].js',
        clean: true,
        library: {
            type: 'module',
        },
    },
    optimization: {
        minimize: false
    },
    plugins: [],
    mode: 'development',
    devServer: {
        contentBase: '/dist',
        hot: true
    }
};