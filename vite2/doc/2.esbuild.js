const { build } = require('esbuild')
const { resolve } = require('path')

;(async () => {
  build({
    absWorkingDir: process.cwd(),
    entryPoints: [resolve('main.js')],
    outfile: resolve('dist/main.js'),
    bundle: true, // 是否打包 
    write: true,
    format: 'esm'
  })
})()

// ;(async () => {
//   build({
//     absWorkingDir: process.cwd(),
//     entryPoints: [resolve('index.html')],
//     outfile: resolve('dist/main.js'),
//     bundle: true, // 是否打包 
//     write: true,
//     format: 'esm'
//   })
// })()

// function 