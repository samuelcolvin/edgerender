const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    assetModuleFilename: 'assets/[name][ext][query]',
  },
  devtool: 'cheap-module-source-map',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.scss', '.sass'],  // TODO remove
    modules: [
      'edgerender',
      'node_modules'
    ]
  },
  plugins: [new CleanWebpackPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          // transpileOnly: true,
        },
      },
      {
        test: /\.s[ac]ss$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].css[query]',
        },
        use: [
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: 'expanded',
              },
            },
          },
        ],
      },
      {
        test: /\.(css|png|ico|jpe?g|svg|woff2?|ttf)$/i,
        type: 'asset/resource',
      },
    ],
  },
}
