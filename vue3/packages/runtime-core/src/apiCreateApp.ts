
export function createAppApi(render){
  return function createApp(rootComp, rootProps) {
    const app = {
      mount(container) {
        // 根据组件创建虚拟节点
        // 调用render进行渲染
        console.log(rootComp);
        
        // const vnode = {}
        // render(vnode, container)
      }
    }
    return app
  }
}
