const path = require('path')
const fs = require('fs-extra')
const Creator = require('./creator')

async function create(name, options) {
  let targetDir = path.resolve(process.cwd(), name)
  // 检查目标目录是否存在
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      const {
        action
      } = await inquirer.prompt([{
        name: 'action',
        type: 'list',
        message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
        choices: [{
            name: 'Overwrite',
            value: 'overwrite'
          },
          {
            name: 'Cancel',
            value: false
          }
        ]
      }])
      if (!action) {
        return
      } else if (action === 'overwrite') {
        console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
        await fs.remove(targetDir)
      }
    }
  }
  // 创建
  const creator = new Creator(name, targetDir)
  await creator.create(options)

}

module.exports = create