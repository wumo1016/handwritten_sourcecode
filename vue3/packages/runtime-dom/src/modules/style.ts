
export const patchStyle = (el, prev, next) => {
  const style = el.style
  if (next == null) { // 新的没有 直接移除
    el.removeAttribute('style')
  } else {
    // 老的有 新的没有 删除
    for (const key in prev) {
      if(next[key] == null) style[key] = ''
    }
    // 老的没有
    for (const key in next) {
      style[key] = next[key]
    }
  }
}
