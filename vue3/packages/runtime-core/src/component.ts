import { ShapeFlags } from "@vue/shared/src"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    setupState: { b: 2 }, // setup返回的对象
    data: { c: 3 },
    ctx: {},
    render: null,
    isMounted: false // 是否挂载过
  }
  instance.ctx = { _: instance }
  return instance
}

export function setupComponent(instance) {

  const { props, chlidren, shapeFlag } = instance.vnode
  instance.props = props // 省略解析 props 和 attrs
  instance.slots = chlidren // 省略解析

  // 有状态组件 || 函数组件
  if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    setupStatefulComponent(instance)
  }
}

function setupStatefulComponent(instance) {

  // 1.代理
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers as any)
  // 2.获取组件的setup
  const { setup, render } = instance.type
  if (setup) {
    setup(instance.props, createSetupContext(instance))
  }
  if(render){
    render(instance.proxy)
  }
}

function createSetupContext(instance) {
  return {
    props: instance.props,
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => { },
    expose: () => { },
  }
}

// instance 描述组件的各种状态
// context setup的参数 就4哥参数 开始方便使用
// proxy render的参数
