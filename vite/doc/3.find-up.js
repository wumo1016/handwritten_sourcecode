const findUp = require('find-up')

!(async () => {
  console.log(
    await findUp('vite', {
      cwd: process.cwd(),
      type: 'directory'
    })
  )
})()

// 返回完整路径
