## 配置 rollup 编译环境

## 使用

- 注册并加载应用 registerApplication()
- 启动应用 start()

## 原理
  - 注册应用
    - appName
    - loadApp => bootstarp mount unount
    - activeWhen
    - curtomProps
  - 启动应用
  - reroute 卸载应用 - 加载应用 - 挂载应用
  - 监听全局 hashchange 和 popstate 事件 然后 reroute
  - 重写 pushstate 和 replacestate 方法 然后 reroute
  - 重写 windoe.addEventListener 和 windoe.addEventListener
  