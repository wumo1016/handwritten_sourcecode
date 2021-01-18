> 服务端的html引用客户端生成的js文件 然后在app.vue中的根加上 id = app

编写一套前端代码 导出函数 返回实例 需要打包两套代码 一套是前端 一套是后端

前端的打包入口直接挂载el
后端的打包入口需要导出一个函数 供 renderToString 的时候使用

前端正常打包
后端需要设置成 moudule.exports 这种格式 target: node libraryTarget: commonjs2
然后在模板中需要设置替换的内容 `<!--vue-ssr-outlet-->`然后还需要设置插入打包后的文件

vue-router使用history模式
后端需要配置一个访问任何页面都返回模板页面 router.get('/(.*)')
还需要配置一个404页面 前端使用 router.onReady 和 router.getMatchedComponents
如果没有匹配到 返回 code 404 后端处理