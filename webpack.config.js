const path = require('path');
const Dotenv = require('dotenv-webpack')

module.exports = {
  entry: {
    main: './src/js/main.js',
    dbhelper: './src/js/dbhelper.js'
  },
  plugins: [
    new Dotenv()
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist/js')
  },
  mode: 'development'
};