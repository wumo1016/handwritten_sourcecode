## 文档(http://www.zhufengpeixun.com/strong/html/103.16.vite.2.html)

## 介绍

- 开发无需打包
- 开发环境采用 esbuild 构建
- 生产环境采用 roolup 打包

## 依赖模块

- connect: 类似于 express
- serve-static: 静态文件中中间件
- es-module-lexer: JS 模块语法解析器
- resolve: 实现了 node 的 require.resolve()算法
- fast-glob: 该包提供了一些方法，用于遍历文件系统

## 步骤

- 实现 vite2-1 命令
  - npm link 将当前项目链接至全局下 就可以在全局下使用命令 vite2-1
  - 查看效果 npm root -g
- 创建服务器
  - 启动服务
  - 静态文件中间件
- 预编译
  - 扫描整个项目，找到第三方依赖
    - 先通过 scanImports(esbuild) 找到第三方依赖
  - 编译(打包)这些第三方依赖，放到.vite 目录中去
    - 将每个依赖通过 esbuild 编译到缓存目录中去，并保存依赖关系 json
  - 重写导入的路径，指向编译后的路径
    - 通过请求中间件拦截请求
  - 合并用户配置(用户插件)
  - esbuild 处理 vue 文件
- 实现 vue 插件
  - 使用 vue/compiler-sfc 解析 vue 文件 然后返回
- 热更新
  - 服务端根据 http 服务器建立一个 websocket 服务
  - 客户端发送一个 websocket 请求 建立链接
  - 通过 chokidar 监听文件变化
    - 在 import-analysis 的时候 需要建立一个模块依赖图 (哪些模块导入了自己 自己接受哪些模块的变更)
  - 通过 socket 通知客户端重新请求的文件 和 需要执行更新方法的文件
    - 通过 import 获取重新请求文件的内容

## esbuild

- build.onResolve
  - 地址: https://esbuild.github.io/plugins/#on-resolve
  - 只要匹配到第一个就不会再走下一个匹配到的 onResolve
  - 回调函数 ({ path, importer })
    - path: 入口地址 / `import xx from 'yy'` 后面的 yy
    - importer: 使用这个导入语句的文件
- build.onLoad
  - 文档地址: https://esbuild.github.io/plugins/#on-load
