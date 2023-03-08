const { execa } = require('@vue/cli-shared-utils')

exports.executeCommand = function executeCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = execa(command, args, {
      cwd,
      stdio: ['inherit', 'inherit', 'inherit']
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`command failed: ${command} ${args.join(' ')}`))
        return
      }
      resolve()
    })
  })
}
