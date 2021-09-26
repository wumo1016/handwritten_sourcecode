# vuex4

## 创建流程

- 导出一个 createStore 方法
  - 返回一个对象 包含 install 方法
  - 可以多次创建 所以应该有一个 Store 类 每次直接返回一个实例
- 导出一个 useStore 方法

## 问题

- 如果多次创建 store 实例 那么 useStore 返回的到底是哪个 state 呢

  - 可以在注册 store 的时候加名字 `app.use(store, 'wyb')`
  - 然后在使用的也加上名字 `useStore('wyb')`

- 是否监控数据是否是 mutation 修改的
- mutation 为什么必须是同步
- 为什么数据只能通过 mutaiton 更改
- 为什么要有 action
  - 不同的页面需要调用同一个接口更改不同的数据

```javascript
{
  commit: ƒ boundCommit(type, payload, options)
  dispatch: ƒ boundDispatch(type, payload)
  getters: {}
  strict: false
  _actionSubscribers: []
  _actions: {asyncAdd: Array(1)}
  _committing: false
  _devtools: undefined
  _makeLocalGettersCache: {}
  _modules: ModuleCollection {root: Module}
  _modulesNamespaceMap: {}
  _mutations: {add: Array(1)}
  _state: Proxy {data: {…}}
  _subscribers: []
  _wrappedGetters: {double: ƒ}
  state: Proxy
}
```
