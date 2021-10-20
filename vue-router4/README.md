## 前端路由的两种模式

- hash 模式 `window.location.hash = '#`
- history 模式 `history.pushState(state, null, path) history.replaceState()`
- 目前浏览器都支持了 `history.pushState` 不考虑兼容性

## 区别

- hash: 不会刷新页面 刷新页面的时候不会发送请求 不支持服务端渲染 不能做 seo 优化 丑
- history: 会刷新页面 刷新页面的时候会发送请求 如果资源不存在 就会出现 404

## 导航解析流程

- 在失活的组件里调用 beforeRouteLeave 守卫。
- 调用全局的 beforeEach 守卫。
- 在重用的组件里调用 beforeRouteUpdate 守卫(2.2+)。
- 在路由配置里调用 beforeEnter。
- 在被激活的组件里调用 beforeRouteEnter。
- 调用全局的 beforeResolve 守卫(2.5+)。 导航被确认。
- 调用全局的 afterEach 钩子。 触发 DOM 更新。
- 调用 beforeRouteEnter 守卫中传给 next 的回调函数，创建好的组件实例会作为回调函数的参数传入。
