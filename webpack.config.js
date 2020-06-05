const webpack = require('webpack'),
  path = require('path'),
  { CleanWebpackPlugin } = require('clean-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  WriteFilePlugin = require('write-file-webpack-plugin');

const fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2'];

const options = {
  entry: {
    injected: path.join(__dirname, 'src', 'js', 'injected.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js')
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json', to: 'manifest.json',
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString())
            }))
          }
        }]
    }),

    new WriteFilePlugin()
  ]
};

if (process.NODE_ENV === 'development')
  options.devtool = 'cheap-module-eval-source-map';

module.exports = options;
