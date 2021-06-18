const path = require('path');

module.exports = {
    cache: false,
    experiments: {
        outputModule: true,
        executeModule: true,
    },
    entry: {
        thurstonEuc: './src/thurstonEuc.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist/build'),
        filename: '[name].js',
        clean: true,
        library: {
            type: 'module',
        },
    },
    plugins: [],
    mode: 'development',
    devServer: {
        contentBase: '/dist',
        hot: true
    }
};