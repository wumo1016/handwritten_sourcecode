import { createAppApi } from './apiCreateApp'
export function createRenderer(renderOptions) {

  const render = (vnode, container) => {

  }

  return {
    createApp: createAppApi(render)
  }
}
