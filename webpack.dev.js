const path = require('path')
const doteenv = require('dotenv')
doteenv.config()
const { merge } = require('webpack-merge')
const common = require('./webpack.config.js')

const PORT = Number(process.env.PORT) | 9000

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    compress: true,
    hot: true,
    port: PORT,
    static: {
      directory: path.join(__dirname, './dist'),
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },
})
