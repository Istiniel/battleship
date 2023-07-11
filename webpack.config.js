const path = require('path')
const ESLintWebpackPlugin = require('eslint-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  target: 'node',
  entry: './index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [new ESLintWebpackPlugin({ extensions: 'ts' }), new CleanWebpackPlugin()],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './dist'),
  },
}
