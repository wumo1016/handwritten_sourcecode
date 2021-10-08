- createStore
  - `app.provide(key, new Store())`
- useStore
  - `inject(key)`
- 构建树形模块关系
  - `this._modules = new ModuleCollection(options)`
- 写一个 ModuleCollection 类 构建以下 state 关系
  - root 属性
  - register(rawModule, path) 方法
  ```javascript
  const root = {
    _raw: rootModule,
    _state: rootModule.state,
    _children: {
      aCount: {
        _raw: aModule,
        _state: aModule.state,
        _children: {
          cCount: {
            _raw: cModule,
            _state: cModule.state,
            _children: {}
          }
        }
      },
      bCount: {
        _raw: bModule,
        _state: bModule.state,
        _children: {}
      }
    }
  }
  ```
- 组装 state installModule
  ```javascript
  root = {
    _state: {
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
  }
  ```
- 设置 resetStoreState 设置响应式 state
- 设置 commit 方法 先将 mutations 保存到 `store._mutations` 上 然后调用 commit 的是时候直接从`_mutations`上取
- 设置 dispatch 方法 先将 actions 保存到 `store._actions` 上 然后调用 dispatch 的时候从`_actions`上取
- 严格模式 strict
  - 严格模式下 通过非 commit 修改 state 会直接抛错
- 插件系统 是一个函数数组
  - plugins
  - `subscribe => _subscribers` 再 commit 之后执行
- replaceState 替换当前状态 比如持久化
- 动态注册模块 registerModule
