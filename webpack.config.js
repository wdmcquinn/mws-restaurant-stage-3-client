const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: {
      main: './src/js/main.js',
      restaurant: './src/js/restaurant_info.js'
    },
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name]-bundle.js',
      //publicPath: '/dist'
    },
  devtool: 'source-map',
  module: {
      rules: [
          {
              test: /\.js$/,
              use: [
                  {
                      loader: 'babel-loader',
                      options: {
                          presets: ['env']
                      }
                  }
              ]
          },{
              test: /\.html$/,
              use: ['html-loader']
          },{
              test: /\.css$/,
              use: ['style-loader', 'css-loader']
          }
      ]
  },
  plugins: [
      new Dotenv(),
      new HtmlWebpackPlugin({
          filename: 'index.html',
          template: 'src/index.html',
          chunks: ['main']
      }),
      new HtmlWebpackPlugin({
          filename: 'restaurant.html',
          template: 'src/restaurant.html',
          chunks: ['restaurant']
      }),
      new CleanWebpackPlugin(['dist']),
      new CopyWebpackPlugin([{from:'src/img', to:'img'}]),
      new CopyWebpackPlugin([{from:'src/sw.js', to:'sw.js'}])
  ], 
  mode: 'development'
}


