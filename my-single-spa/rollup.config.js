import serve from 'rollup-plugin-serve'

// rollup可以帮我们打包 es6的模块化语法
export default {
  input: './src/single-spa.js', // 入口
  output: {
    file: './lib/umd/single-spa.js', // 输出文件
    format: 'umd',
    name: 'singleSpa',
    sourcemap: true
  },
  plugins: [
    // https://www.npmjs.com/package/rollup-plugin-serve
    serve({
      openPage: '/index.html',
      contentBase: '',
      port: 3001,
      historyApiFallback: '/index.html' // history路由
    })
  ]
}
