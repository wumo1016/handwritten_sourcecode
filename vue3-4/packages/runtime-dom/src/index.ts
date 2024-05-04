/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-04 17:14:11
 */
export * from '@vue/runtime-core'
import { createRenderer } from '@vue/runtime-core'

import { nodeOps } from './nodeOps'
import patchProp from './patchProp'

const renderOptions = Object.assign({ patchProp }, nodeOps)

export const render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container)
}
