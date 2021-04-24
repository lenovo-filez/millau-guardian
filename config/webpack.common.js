'use strict';

const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');
const PATHS = require('./paths');
const webpack = require('webpack')

// To re-use webpack configuration across templates,
// CLI maintains a common webpack configuration file - `webpack.common.js`.
// Whenever user creates an extension, CLI adds `webpack.common.js` file
// in template's `config` folder
const common = {
  output: {
    // the build folder to output bundles and assets in.
    path: PATHS.build,
    // the filename template for entry chunks
    filename: '[name].js',
  },
  devtool: 'source-map',
  stats: {
    all: false,
    errors: true,
    builtAt: true,
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      // Help webpack in understanding CSS files imported in .js files
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.less$/,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'less-loader',
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_module/
      },
      {
        test: /\.vue$/,
        exclude: /node_module/,
        loader: "vue-loader",
      },
      // Check for images imported in .js files and
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|jpg|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
            limit: 10000,  //小于8kb转换为base64
            name: 'img/[name].[hash].[ext]'
        }
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'PUBLIC_VERSION': JSON.stringify(process.env.PUBLIC_VERSION)
    }),
    // Print file sizes
    new SizePlugin(),
    // Copy static assets from `public` folder to `build` folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: '**/*',
          context: 'public',
        },
      ]
    }),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new VueLoaderPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "build"),
    index: 'popup.html',
    compress: true,
    port: 9000
  }
};

module.exports = common;
