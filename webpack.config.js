const path = require('path')

module.exports = {
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    assetModuleFilename: 'assets/[name].[hash][ext][query]',
    clean: true,
  },
  devtool: false,
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['edgerender', 'node_modules'],
  },
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
          filename: 'assets/[name].[hash].css[query]',
        },
        loader: path.join(__dirname, 'custom-sass-loader.js'),
      },
      {
        test: /\.(css|png|ico|jpe?g|svg|woff2?|ttf)$/i,
        type: 'asset/resource',
      },
    ],
  },
}
