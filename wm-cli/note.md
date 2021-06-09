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
  - `npm link` 创建软链 将命令链接至全局
  - 测试命令 `wm` 就会执行 bin/wm.js 文件

## 实现create命令
  ### 实现一级选择
    ```
      vue3_template ([Vue 3] dart-sass, typescript, router, vuex, eslint) 
      Default ([Vue 2] babel, eslint)
      Default (Vue 3 Preview) ([Vue 3] babel, eslint)
      Manually select features
    ```
    - 安装commander `yarn workspace wm-cli add commander`
      - 文档 `https://segmentfault.com/a/1190000019350684`