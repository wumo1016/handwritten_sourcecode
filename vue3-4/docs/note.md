## 初始化开发环境

```sh
pnpm init

# 新建 .npmrc 文件

# pnpm install vue

# 新建 packages 文件夹
# 新建 pnpm-workspace.yaml 文件

pnpm install typescript esbuild minimist -D -w

# 新建 tsconfig.json 文件

# 给指定包安装工具区依赖(例如：reactivity 下安装 shared 模块)
pnpm install @vue/shared --workspace --filter @vue/reactivity

```
