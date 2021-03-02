import { isFunction, isObject, ShapeFlags } from "@vue/shared/src"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    setupState: {}, // setup返回的对象
    data: {},
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
  const { setup } = instance.type
  if (setup) {
    const setupResult = setup(instance.props, createSetupContext(instance)) // 对象或者函数
    handleSetupResult(instance, setupResult)
  }

  finishComponentSetup(instance)
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

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
}

function finishComponentSetup(instance) {
  let { render, template } = instance.type
  if (!instance.render) {
    // 将template编译成render函数 并挂载到实例上
    if (!render && template) {

    }
    instance.render = render
  }
  // 对vue2.x Api处理

}

// instance 描述组件的各种状态
// context setup的参数 就4个参数 开始方便使用
// proxy render的参数
