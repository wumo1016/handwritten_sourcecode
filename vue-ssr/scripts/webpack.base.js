// webpack打包的入口文件 ， 需要导出配置

// webpack webpack-cli

// @babel/core babel的核心模块 
// babel-loader  webpack和babel的一个桥梁
// @babel/preset-env  把es6+ 转换成低级语法

// vue-loader vue-template-compiler  解析.vue文件 并且编译模板
// vue-style-loader css-loader 解析css样式并且插入到style标签中， vue-style-loader支持服务端渲染

// html-webpack-plugin 将打包的

const VueLoaderPlugin = require('vue-loader/lib/plugin')

const path = require('path')
module.exports = {
  mode: 'development',
  output: {
    filename: '[name].bundle.js', // 默认是dist目录
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [{
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader', // 默认调用 @babel/core 然后需要配置预设
          options: {
            presets: ['@babel/preset-env']
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false, // 为了配置使用 vue-style-loader
            }
          }
        ] // 从右向左执行
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin() // 配合 vue-loader 使用
  ]
}