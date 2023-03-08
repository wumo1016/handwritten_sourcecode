## 常用工具包

- commander
  - 一个命令行解决方案
  - 可以告诉用户脚手架的命令和功能, 以及处理用户的输入
- chalk
  - 终端字符串美化工具
- inquirer
  - 交互式命令行工具
- ejs
  - 模板引擎
- fs-extra
  - 继承了所有 fs 的方法, 并添加了 promise

## 创建全局命令

- 在 package.json 文件中添加属性

```json
  "bin": {
    "next-cli": "bin/main.js"
  },
```

- 新建 `bin/main.js`
- 在项目根目录执行 npm link
