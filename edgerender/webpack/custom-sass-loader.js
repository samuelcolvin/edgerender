const path = require('path')
const sass = require('sass')

// webpack loader for sass to include map files, see https://github.com/webpack/webpack/discussions/13505
module.exports = async function() {
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
