const path = require('path');

module.exports = {
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
};