const {merge} = require('webpack-merge');
const path = require('path');
// plugin to remove comment from javascript files
const TerserPlugin = require('terser-webpack-plugin');
// plugin used to copy files from 3dparty modules in a vendor directory
const CopyPlugin = require("copy-webpack-plugin");

const common = require('./webpack.prod.gen.js');

module.exports = merge(common, {
    entry: {
        thurstonSph: './src/thurstonSph.js'
    },
});