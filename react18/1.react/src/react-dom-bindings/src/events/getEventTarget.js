/**
 * @Author: wyb
 * @Descripttion: 获取触发事件的实际元素
 * @param {*} nativeEvent
 */
function getEventTarget(nativeEvent) {
  const target = nativeEvent.target || nativeEvent.srcElement || window
  return target
}

export default getEventTarget
