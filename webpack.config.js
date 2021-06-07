const path = require('path')
const sass = require('sass')

// webpack loader for sass to include map files, see https://github.com/webpack/webpack/discussions/13505
async function sass_loader() {
  const {resourcePath, emitFile, async} = this
  const callback = async()
  const output_name = path.parse(resourcePath).base.replace(/\.s[ac]ss$/, '.css')
  sass.render(
    {
      file: resourcePath,
      outFile: output_name,
      sourceMap: true,
      sourceMapContents: true,
      sourceMapRoot: '/styles/',
    },
    (err, result) => {
      if (err) {
        callback(err)
      } else {
        // hide my local development path from prying eyes.
        const map = result.map.toString().replace(/file:\/\/.+?\/([^\/]+\.s[ac]ss)/g, '$1')
        // output path of the map file is currently (somewhat) hard coded
        emitFile(`assets/${output_name}.map`, map)
        callback(null, result.css)
      }
    },
  )
}

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
        loader: sass_loader,
      },
      {
        test: /\.(css|png|ico|jpe?g|svg|woff2?|ttf)$/i,
        type: 'asset/resource',
      },
    ],
  },
}
