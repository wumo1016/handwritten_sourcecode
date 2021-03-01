import { apiCreateApp } from './apiCreateApp'
import { patch } from './patch';

export function createRenderer(renderOptions) {

  const render = (vnode, container) => {
    // 根据不同虚拟节点创建对应的真实元素
    patch(null, vnode, container)

    // console.log(vnode, container);
  }

  return {
    createApp: apiCreateApp(render)
  }
}
