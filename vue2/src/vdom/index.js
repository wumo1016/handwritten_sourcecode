export function createElement(vm, tag, props = {}, ...children) {
  return vnode(vm, tag, props, props.key, children)
}

export function createTextElement(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, data, key, children, text) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text
  }
}