import { createVNode } from "./vnode";

export function createAppApi(render){
  return function createApp(rootComp, rootProps) {
    const app = {
      _props: rootProps,
      _component: rootComp,
      _container: null,
      mount(container) {
        // 1.根据组件创建虚拟节点
        const vnode = createVNode(rootComp, rootProps)
        // 2.调用render进行渲染

        console.log(rootComp);
        
        // const vnode = {}
        // render(vnode, container)
        app._container = container
      }
    }
    return app
  }
}
