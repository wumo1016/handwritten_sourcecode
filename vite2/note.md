## 步骤

- 在 package.json 中 新建一下命令 建立对应的文件 然后在当前目录下 执行 npm link 链接至全局

```js
  "bin": {
    "wvite2": "./bin/vite.js"
  },
```

## 功能点

- 静态文件服务
- 依赖预构建

  - 在项目启动前分析依赖 找到第三方包的依赖 进行预打包到 node_modules/.vite/ 对应的文件中去
  - 通过 `runOptimize` 方法 获取第三方依赖 `deps`

    ```json
    {
      "vue": "E:/wumo/handwritten_sourcecode/vite2/test/node_modules/vue/dist/vue.runtime.esm-bundler.js"
    }
    ```

  - 将导入的地方 将路径改掉
    `import { createApp } from 'vue'` => `import { createApp } from '/node_modules/.vite/deps/vue.js?v=071672c8'`
