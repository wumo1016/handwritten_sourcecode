import { createVNode } from "./vnode";

export function apiCreateApp(renderer){
  return function createApp(rootComp, rootProps) {
    const app = {
      _props: rootProps,
      _component: rootComp,
      _container: null,
      mount(container) {
        // 1.根据组件创建虚拟节点
        const vnode = createVNode(rootComp, rootProps)
        // 2.renderer
        renderer(vnode, container)

        app._container = container
      }
    }
    return app
  }
}
