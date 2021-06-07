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