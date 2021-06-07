> `http://www.zhufengpeixun.com/grow/html/133.vue-cli.html#t01.%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C`
## 首先全局安装 `lerna` 它是一个npm包管理器
  - yarn 用于处理依赖 执行`yarn`可以将packages下的包添加到node_modules(超链接到packages)
  - lerna 用于初始化和发布

## 添加全局命令
  - 在package.json文件中添加 
  ```
    "bin": {
      "wm": "bin/vue.js"
    }
  ```
  - wm为全局命令 后面为需要执行的文件
  - 添加完成后 使用npm link将命令添加到全局中(在目标package.json目录中)

## wu-cli-utils
  - 添加依赖 `yarn workspace wu-cli-utils add chalk execa` 找到目标工作空间 添加依赖

## wu-cli
  - 添加依赖 `yarn workspace wu-cli add commander inquirer execa chalk ejs globby lodash.clonedeep fs-extra ora isbinaryfile`

## 一些常用库
  - commander：一款强大的命令行框架 提供了用户命令行输入和参数解析功能
  - liquirer：交互式命令行工具
  - execa：可以调用shell和本地外部程序