import { createRenderer } from "@vue/runtime-core/src";
import { extend } from "@vue/shared/src";
import { nodeOps } from "./nodeOps";
import { patchProps } from "./patchProps";
export * from "@vue/runtime-core/src";

// nodeOps是对象 patchProps是函数

// 渲染用到的所有方法 node操作api
const renderOptions = extend({ patchProps }, nodeOps)

export function createApp(rootComp, rootProps = null){
  
  const app: any = createRenderer(renderOptions).createApp(rootComp, rootProps)
  const { mount } = app
  app.mount = function(container){
    container = nodeOps.querySelector(container)
    container.innerHTML = ''
    mount(container)
  }

  return app
}
