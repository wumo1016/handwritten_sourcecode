## 环境搭建

- `pnpm init`
- 根目录下新建 `.pnpm-workspace.yml` 配置文件
  ```yml
  packages:
    - 'packages/*'
  ```
- 安装依赖
  - 根目录下安装后面加上 `-w` (目前默认直接安装在根目录下)
- 安装开发依赖 `pnpm install esbuild typescript minimist -D`
- 在各自的模块下建立 `package.json` 文件
- 初始化 ts 配置文件 `pnpm tsc --init`
- 安装依赖包 `pnpm install @vue/shared@workspace --filter @vue/reactivity` 意思将 @vue/shared 安装到 @vue/reactivity 中 (@workspace 表示是一个本地包)

## 其他

- npm
  - 幽灵依赖问题
    - 能使用并没有安装的包 是因为使用的第三方依赖了 例如 bootstrap => animate.css
- pnpm
  - 由于 pnpm 会把有些第三方依赖的包放在 .pnpm 目录中 所有导致项目无法直接使用这些包
  - 这个时候 如果还是想直接使用 可以在项目下新建 `.npmrc` 文件 目的是将所有文件也放在 node_modules 目录下
  ```yml
  shamefully-hoist = true
  ```

## reactvity

- reactive

  - 只能对对象进行代理 否则直接返回
  - 使用 Proxy 进行代理 配合 Reflect 进行使用
  - 处理重复代理问题
    - 重复代理原对象 直接返回原来的 Proxy ---- 使用 WeakMap 做缓存
    - 代理代理后的 proxy (添加一个标记)
  - baseHandler
    - get
      - track
    - set
      - trigger

- effect

  - 默认会执行一次 后续数据变化了会重新执行 effect 函数
  - 创建一个响应式的 ReactiveEffect
    - run
      - 先将当前的 activeEffect 缓存起来
      - 将 activeEffect 设置为当前的 effect
      - 当传入的 fn 执行完毕后 再将 activeEffect 设置为之前的 activeEffect
    - stop
    - 解决嵌套 effect 问题
      - 栈
      - 每个 effect 记住自己的父亲
  - 每个 effect 应该需要关联那些属性 以便如果当前 effect 被清理 也可以将这个 effect 将对应的属性 Set 集合中清理
  - 处理再 effect 更改自己依赖的属性 导致死循环的问题
    - 在循环执行 effect 的时候 判断如果自己 effect 触发的 就不再执行了
  - 处理分支切换问题
    - cleanEffect 在每次执行 effect 之前 清空当前 effect 绑定的属性 并将其从使用到这个 effect 属性 Set 中移除 (注意循环引用问题)
  - 处理在同时修改状态 导致多次执行 effect 的问题
    - scheduler 每次数据变化的时候 如果传了 优先调用 scheduler 函数

- track(target, key)
  - 做一个两层缓存结构 { object1: { name: [effect1], age: [effect2] } }
  - 先针对对象做一个 WeakMap => Map
  - 再针对属性做一个 Map => Set
- trigger(target, key)

  - 拿到对应的 deps 遍历执行

- computed

  - 默认传入一个 get 函数 默认不会执行 (也可以写成 对象的方式 get set)
  - 将真实的返回值包装到 value 属性上
  - 有缓存
  - 也是一个 effect
  - dirty
  - 依赖收集

- ref
  - 创建一个 RefImpl 实例
  - 设置一个 `_value` 原值放在 `rawValue` 上
  - get value 依赖收集
  - set value 触发更新
  - 如果被 reactive 使用 会自动拆包 使用的时候不需要加.value
  - 其他
    - toRef(object, key)
      - 创建一个 ObjectRefImpl
      - get value => object[key]
      - set value => object[key] = value
    - toRefs(object)
      - 创建一个新对象 循环传入的对象 将所有值用 toRef 包裹一下
    - proxyRefs(object)
      - 将 ref 包装到一个新对象上
      - 通过 Proxy 代理实现

## runtime-dom

- 提供一些常用的节点操作 api
- watch
  - 监控的如果是一个对象
    - 是无法拿到新值和老值的
    - 如果是一个响应式对象 需要对所有属性都进行一次取值操作 以便触发依赖收集
  - 默认深度检测
  - onCleanup
    - 执行下一次的监听函数 会执行上一次的 onCleanup 的回调
- render
  - createRenderer

## runtime-core

- 主要是虚拟 dom
- createVNode
  - 创建一个虚拟节点
- h
  - 两个参数
  - 三个参数
- render(vnode, container)
  - 初始化
  - 更新 diff
  - 卸载
  - 将每一次的 vnode 保存到容器上
- createRenderer
  - render
    - patch(oldVNode, newVNode, container)
      - processText(n1, n2, container)
        - n1 == null => 初始化
          - 创建文本节点并插入
      - processElement(n1, n2, container)
        - n1 == null => 初始化
          - mountElement(vnode, container)
            - patchProps
            - hostSetElementText
            - mountChildren(children, container)
            - hostInsert

## vue

- 主要两部分
  - 编译时
    - compiler-dom => compiler-core
    - 将模板编译成 render 函数
  - 运行时
    - 将虚拟节点变成真实节点
    - runtime-dom(提供 dom api) => runtime-core(生成 dom) => reactivity
