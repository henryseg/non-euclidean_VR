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
    },
    module: {
        rules: [
            {
                test: /\.(jpg|png)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext][query]'
                }
            },
            {
                test: /\.glsl$/,
                loader: 'webpack-glsl-loader'
            }
        ]
    },
    // optimization: {
    //     minimize: false
    // },
    plugins: [],
    mode: 'development',
    devServer: {
        contentBase: '/dist',
        hot: true
    }
};