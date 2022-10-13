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
