import { createRenderer } from 'packages/runtime-core/src/renderer'
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp'

export * from '@vue/runtime-core'

// 默认 dom 操作 API
const renderOptions = {
  patchProp,
  ...nodeOps
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} vnode
 * @param {*} container
 */
export function render(vnode, container) {
  const { render } = createRenderer(renderOptions)
  render(vnode, container)
}
