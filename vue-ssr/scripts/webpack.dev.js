const HhmlWebpackPlugin = require('html-webpack-plugin')
const {
  merge
} = require('webpack-merge') // 合并配置
const base = require('./webpack.base.js')
const path = require('path')

module.exports = merge(base, {
  entry: {
    client: path.resolve(__dirname, '../src/client-entry.js') // 通过这种命名生成后的文件名字就是 client.bundle.js
  },
  plugins: [
    new HhmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      filename: 'client.html'
    }),
  ]
})