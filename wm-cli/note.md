## 创建项目
  - `lerna init` 初始化项目
  - 在lerna.json中添加如下代码
    ```
      "useWorkspaces": true,
      "npmClient": "yarn",
    ```
  - 在package.json中添加如下代码
    ```
      "workspaces": [
        "packages/*"
      ],
    ```
  - 在 wm-cli 目录下使用命令`lerna create wm-cli`创建一个目录
  - 在 packages/wm-cli 中创建 bin/wm.js 文件 并添加如下代码 表示使用node执行这个文件
    ```
    #!/usr/bin/env node
    ```
  - 在 packages/wm-cli 目录下的package.json中添加代码
    ```
      "bin": {
        "wm": "bin/vue.js"
      },
    ```
    - `npm root -g`可查看npm的全局依赖安装目录
    - 如果自定义的全局已经存在 可以到npm目录下删除相关文件 `wm wm.cmd wm.ps1`
  - 使用 `yarn install` 将packages目录下的目录链接到node_modules中
  - `npm link` 创建软链 将命令链接至全局 如果已经存在 可以加 `--froce` 强制覆盖
  - 测试命令 `wm` 就会执行 bin/wm.js 文件

## 实现create命令
  ### 实现一级选择
    ```
      vue3_template ([Vue 3] dart-sass, typescript, router, vuex, eslint) 
      Default ([Vue 2] babel, eslint)
      Default (Vue 3 Preview) ([Vue 3] babel, eslint)
      Manually select features
    ```
    - 安装 commander `yarn workspace wm-cli add commander`
      - 介绍：命令行框架 提供了用户命令行输入和参数解析功能
      - 文档1 `https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md`
      - 文档2 `https://segmentfault.com/a/1190000019350684`
    - 安装 inquirer `yarn workspace wm-cli add inquirer`
      - 介绍：命令行交互工具
      - 文档1 `https://www.npmjs.com/package/inquirer`
      - 文档2 `https://blog.csdn.net/qq_26733915/article/details/80461257`
    - 安装 chalk `yarn add chalk -W`
      - 介绍：控制修改控制台字符串的样式 包括字体样式、颜色、背景等

## 一些常用库
  - commander：一款强大的命令行框架 提供了用户命令行输入和参数解析功能
  - liquirer：交互式命令行工具
  - execa：可以调用shell和本地外部程序
  - chalk：控制修改控制台字符串的样式 包括字体样式、颜色、背景等
  - isbinaryfile：检测一个文件是否是二进制文件
  - ora：实现nodejs命令行环境的loading效果和显示各种状态的图标
  - ejs：模板引擎
  - slash：可以将windows的反斜杠转换为斜杠路径 如：foo\\bar => foo/bar
  - globby：用于模式匹配目录文件