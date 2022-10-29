import {
  registerSimpleEvents,
  topLevelEventsToReactNames
} from '../DOMEventProperties'
import { IS_CAPTURE_PHASE } from '../EventSystemFlags'
import { accumulateSinglePhaseListeners } from '../DOMPluginEventSystem'
import { SyntheticMouseEvent } from '../SyntheticEvent'

/**
 * @Author: wyb
 * @Descripttion:
 */
function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget, // click => onClick
  eventSystemFlags,
  targetContainer
) {
  // 合成事件的构建函数
  let SyntheticEventCtor
  switch (domEventName) {
    case 'click':
      SyntheticEventCtor = SyntheticMouseEvent
      break
    default:
      break
  }
  // 获取 原生事件名 对应的 react 事件名
  const reactName = topLevelEventsToReactNames.get(domEventName)
  // 是否是捕获
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  // 获取事件队列 先添加的都是子元素的事件
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase
  )
  if (listeners.length > 0) {
    // 创建合成事件实例
    const event = new SyntheticEventCtor(
      reactName,
      domEventName,
      null,
      nativeEvent,
      nativeEventTarget
    )
    dispatchQueue.push({
      event, // 合成事件实例
      listeners // 监听函数数组
    })
  }
}

export { registerSimpleEvents as registerEvents, extractEvents }
