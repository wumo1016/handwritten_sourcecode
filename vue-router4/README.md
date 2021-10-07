## 前端路由的两种模式

- hash 模式 `window.location.hash = '#`
- history 模式 `history.pushState(state, null, path) history.replaceState()`
- 目前浏览器都支持了 `history.pushState` 不考虑兼容性

## 区别

- hash: 不会刷新页面 刷新页面的时候不会发送请求 不支持服务端渲染 不能做 seo 优化 丑
- history: 会刷新页面 刷新页面的时候会发送请求 如果资源不存在 就会出现 404
