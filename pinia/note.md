## 优点

- 体积小
- 使用 TS
- 没有命名空间 可以创建多个 store 来进行统一管理数据
- 只有 action 没有 mutition 了

## 流程

- createPinia
- defineStore
- 支持 compositionApi 传入的方式
- $patch 批量修改状态
- $reset 重置状态 (只有使用 optionsStore 才可以)
- $subscribe() 订阅状态改变的
- $onActions 订阅 action 的
- $dispose()
- $state 批量覆盖状态
- plugins
  - 每个 store 创建的时候都会调用 store
