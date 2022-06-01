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
    - 重复代理原对象 (使用 WeakMap 做缓存)
    - 代理代理后的 proxy

- effect
  - 默认会执行一次 后续数据变化了会重新执行 effect 函数
