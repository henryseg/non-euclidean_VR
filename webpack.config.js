const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

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
        // environment: {
        //     module: true,
        //     dynamicImport: true,
        // },
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
                test: /\.glsl.mustache$/,
                use: [
                    {loader: 'mustache-loader'},
                    // {loader: 'strip-whitespace-loader'},
                    // {loader: 'webpack-comment-remover-loader'}
                ]
            },
            {
                test: /\.glsl$/,
                use: [
                    {loader: 'webpack-glsl-loader'},
                    {loader: 'strip-whitespace-loader'},
                    {loader: 'webpack-comment-remover-loader'},
                ]
            }
        ]
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
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        port: 9000,
        hot: true
    }
};