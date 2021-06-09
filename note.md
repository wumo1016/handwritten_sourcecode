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
  - 在packages目录下使用命令`lerna create cli`创建一个目录
  - 在cli中创建 bin/wm.js 文件 并添加如下代码 表示使用node执行这个文件
    ```
    #!/usr/bin/env node
    ```
  - 在cli目录下的package.json中添加代码
    ```
      "bin": {
        "wm": "bin/vue.js"
      },
    ```
  - `npm root -g`可查看npm的全局依赖安装目录
