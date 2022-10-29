import {
  registerSimpleEvents,
  topLevelEventsToReactNames
} from '../DOMEventProperties'
import { IS_CAPTURE_PHASE } from '../EventSystemFlags'
import { accumulateSinglePhaseListeners } from '../DOMPluginEventSystem'

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
  // 获取 原生事件名 对应的 react 事件名
  const reactName = topLevelEventsToReactNames.get(domEventName)
  // 是否是捕获
  const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  // 获取事件队列
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    isCapturePhase
  )
  console.log(eventSystemFlags, listeners)
}

export { registerSimpleEvents as registerEvents, extractEvents }
