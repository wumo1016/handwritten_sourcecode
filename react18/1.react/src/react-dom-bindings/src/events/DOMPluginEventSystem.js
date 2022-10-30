import { allNativeEvents } from './EventRegistry'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { IS_CAPTURE_PHASE } from './EventSystemFlags'
import { createEventListenerWrapperWithPriority } from './ReactDOMEventListener'
import {
  addEventCaptureListener,
  addEventBubbleListener
} from './EventListener'
import getEventTarget from './getEventTarget'
import { HostComponent } from 'react-reconciler/src/ReactWorkTags'
import getListener from './getListener'

const listeningMarker = `_reactListening` + Math.random().toString(36).slice(2)
SimpleEventPlugin.registerEvents()

/**
 * @Author: wyb
 * @Descripttion: 监听所有事件
 * @param {*} rootContainerElement
 */
export function listenToAllSupportedEvents(rootContainerElement) {
  // 监听根容器，也就是div#root只监听一次
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true
    // 遍历所有的原生的事件比如click,进行监听
    // allNativeEvents => ['click']
    allNativeEvents.forEach((domEventName) => {
      // 捕获
      listenToNativeEvent(domEventName, true, rootContainerElement)
      // 冒泡
      listenToNativeEvent(domEventName, false, rootContainerElement)
    })
  }
}
/**
 * 注册原生事件
 * @param {*} domEventName 原生事件 click
 * @param {*} isCapturePhaseListener 是否是捕获阶段 true false
 * @param {*} target 目标DOM节点 div#root 容器节点
 */
export function listenToNativeEvent(
  domEventName,
  isCapturePhaseListener,
  target
) {
  let eventSystemFlags = 0 // 默认是0指的是冒泡  4是捕获
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE
  }
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  )
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function addTrappedEventListener(
  targetContainer,
  domEventName,
  eventSystemFlags,
  isCapturePhaseListener
) {
  // 获取监听函数
  const listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags
  )
  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener)
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener)
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 */
export function dispatchEventForPluginEventSystem(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  fiber,
  targetContainer
) {
  dispatchEventForPlugins(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    fiber,
    targetContainer
  )
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function dispatchEventForPlugins(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  fiber,
  targetContainer
) {
  // 事件目标对象
  const nativeEventTarget = getEventTarget(nativeEvent)
  // 派发事件的数组
  const dispatchQueue = []
  // 提取事件
  extractEvents(
    dispatchQueue,
    domEventName,
    fiber,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
  processDispatchQueue(dispatchQueue, eventSystemFlags)
}
/**
 * @Author: wyb
 * @Descripttion:
 */
function extractEvents(
  dispatchQueue,
  domEventName,
  fiber,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    fiber,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
}
/**
 * @Author: wyb
 * @Descripttion: 遍历当前节点一直到顶级节点 获取绑定的事件函数 组成一个队列
 */
export function accumulateSinglePhaseListeners(
  targetFiber,
  reactName,
  nativeEventType,
  isCapturePhase
) {
  const captureName = reactName + 'Capture'
  const reactEventName = isCapturePhase ? captureName : reactName
  const listeners = []
  let instance = targetFiber
  while (instance !== null) {
    const { stateNode, tag } = instance
    if (tag === HostComponent && stateNode !== null) {
      const listener = getListener(instance, reactEventName)
      if (listener) {
        listeners.push(createDispatchListener(instance, listener, stateNode))
      }
    }
    instance = instance.return
  }
  return listeners
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} instance
 * @param {*} listener
 * @param {*} currentTarget
 */
function createDispatchListener(instance, listener, currentTarget) {
  return { instance, listener, currentTarget }
}
/**
 * @Author: wyb
 * @Descripttion: 处理派发队列
 * @param {*} dispatchQueue
 * @param {*} eventSystemFlags
 */
function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  //判断是否在捕获阶段
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i]
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 桉顺序处理派发队列
 * @param {*} event
 * @param {*} dispatchListeners
 * @param {*} inCapturePhase
 */
function processDispatchQueueItemsInOrder(
  event,
  dispatchListeners,
  inCapturePhase
) {
  if (inCapturePhase) {
    // dispatchListeners[子，父]
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      if (event.isPropagationStopped()) {
        return
      }
      const { listener, currentTarget } = dispatchListeners[i]
      executeDispatch(event, listener, currentTarget)
    }
  } else {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        return
      }
      const { listener, currentTarget } = dispatchListeners[i]
      executeDispatch(event, listener, currentTarget)
    }
  }
}
/**
 * @Author: wyb
 * @Descripttion: 执行事件回调
 * @param {*} event
 * @param {*} listener
 * @param {*} currentTarget
 */
function executeDispatch(event, listener, currentTarget) {
  // 合成事件实例currentTarget是在不断的变化的
  // event nativeEventTarget 它的是原始的事件源，是永远不变的
  // event currentTarget 当前的事件源，它是会随着事件回调的执行不断变化的
  event.currentTarget = currentTarget
  listener(event)
}
