import babel from 'rollup-plugin-babel'

export default {
  input: './src/index.js',
  output: {
    format: 'umd', // 支持amd 和commonjs window.Vue
    name: 'Vue',
    file: 'dist/vue.js',
    sourcemap: true, // 调试可以找到源代码(ES6)
  },
  plugins: [
    babel({ // 一般将 babel 的配置单独放在文件.babelrc中
      exclude: 'node_modules/**'
    })
  ]
}
