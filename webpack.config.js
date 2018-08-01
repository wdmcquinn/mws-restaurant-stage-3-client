const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');


module.exports = {
  entry: {
      main: './src/js/main.js',
      restaurant_info: './src/js/restaurant_info.js',
      sw: './src/sw.js'
    },
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
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
          chunks: ['restaurant_info']
      }),
      new CleanWebpackPlugin(['dist']),
      new CopyWebpackPlugin([{from:'src/img', to:'img'}]),
      new WebpackPwaManifest({
        name: "Restaurant Reviews",
        icons: [
          {
            src: path.resolve(__dirname, "src/icons/rricon-192.png"),
            type: "image/png",
            sizes: "192x192"
          },
          {
            src: path.resolve(__dirname, "src/icons/rricon-512.png"),
            type: "image/png",
            sizes: "512x512"
          }
        ],
        start_url: "index.html",
        background_color: "#f3f3f3",
        display: "standalone",
        scope: "/",
        theme_color: "#252831"
      })
  ],
  mode: 'development'
}


