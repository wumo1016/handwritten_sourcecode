# vuex4

## 创建流程

- 导出一个 createStore 方法
  - 返回一个对象 包含 install 方法
  - 可以多次创建 所以应该有一个 Store 类 每次直接返回一个实例
  - 通过 provide/inject 的方式 向全局注入 store 的
  - 在组件实例上仍然添加了\$store 属性
  - state
    - 通过 reactive 将传入的 state 作成响应式添加到 this 上
  - getters
  - mutations
    - 执行 Store 实例上的 commit 方法
- 导出一个 useStore 方法
  - 返回注册时的 Store 实例即可
- 模块化

  - 构建模块化配置 创建一个类 ModuleCollection 返回以下树形结构 再创建一个类 Module 用于创建模块
    ```javascript
    root = {
      _raw: rootModule,
      state: rootModule.state,
      _children: {
        aCount: {
          _raw: aModule,
          state: aModule.state,
          _children: {
            cCount: {
              _raw: cModule,
              state: cModule.state,
              _children: {}
            }
          }
        },
        bCount: {
          _raw: bModule,
          state: bModule.state,
          _children: {}
        }
      }
    }
    ```
  - 如果在模块配置中不添加 namespaced 就会默认将所有模块的 mutations 和 actions 合并到最外层上去
  - 组装 state

    ```javascript
    state = {
      count: 0,
      aCount: {
        count: 0,
        cCount: {
          count: 0
        }
      },
      bCount: {
        count: 0
      }
    }
    ```

  - 组装 mutations(commit)
  - 组装 actions(commit)
  - namespaced
    - a 加 c 没加 c 会被合并到 a 上

## 问题

- 如果多次创建 store 实例 那么 useStore 返回的到底是哪个 state 呢

  - 可以在注册 store 的时候加名字 `app.use(store, 'wyb')`
  - 然后在使用的也加上名字 `useStore('wyb')`

- 是否监控数据是否是 mutation 修改的
- mutation 为什么必须是同步
- 为什么数据只能通过 mutaiton 更改
  - 可以通过 state 直接修改 但是不建议 strict 模式下会直接报错
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
