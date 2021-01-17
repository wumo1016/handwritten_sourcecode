
const HhmlWebpackPlugin = require('html-webpack-plugin')
const {
  merge
} = require('webpack-merge') // 合并配置
const base = require('./webpack.base.js')
const path = require('path')

module.exports = merge(base, {
  target: 'node', // 打包的文件给谁用
  entry: {
    server: path.resolve(__dirname, '../src/server-entry.js')
  },
  output: {
    libraryTarget: 'commonjs2' // 在生成的文件最后导出 module.exports = 
  },
  plugins: [
    new HhmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/ssr.html'),
      filename: 'server.html',
      excludeChunks: ['server'], // 不将生成 server 文件加入到 hmtl 中
      minify: false, // 不压缩
    }),
  ]
})