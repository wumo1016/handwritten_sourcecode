import getEventTarget from './getEventTarget'
import { getClosestInstanceFromNode } from '../client/ReactDOMComponentTree'
import { dispatchEventForPluginEventSystem } from './DOMPluginEventSystem'
import { ContinuousEventPriority, DefaultEventPriority, DiscreteEventPriority } from 'react-reconciler/src/ReactEventPriorities'

/**
 * @Author: wyb
 * @Descripttion: 创建监听函数
 */
export function createEventListenerWrapperWithPriority(
  targetContainer,
  domEventName,
  eventSystemFlags
) {
  const listenerWrapper = dispatchDiscreteEvent
  return listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer
  )
}
/**
 * 派发离散的事件的的监听函数
 * @param {*} domEventName 事件名 click
 * @param {*} eventSystemFlags 阶段 0 冒泡 4 捕获
 * @param {*} container 容器div#root
 * @param {*} nativeEvent 原生的事件
 */
function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent)
}
/**
 * 此方法就是委托给容器的回调，当容器#root在捕获或者说冒泡阶段处理事件的时候会执行此函数
 * @param {*} domEventName
 * @param {*} eventSystemFlags
 * @param {*} container
 * @param {*} nativeEvent
 */
export function dispatchEvent(
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent
) {
  // 获取触发事件的实际dom
  const nativeEventTarget = getEventTarget(nativeEvent)
  // 找到离它最近的 fiber 节点
  const targetFiber = getClosestInstanceFromNode(nativeEventTarget)
  // 派发事件
  dispatchEventForPluginEventSystem(
    domEventName, // click
    eventSystemFlags, // 0 4
    nativeEvent, // 原生事件对象
    targetFiber, // 此真实DOM对应的fiber
    targetContainer // 目标容器
  )
}
/**
 * @Author: wyb
 * @Descripttion: 获取事件优先级
 * @param {*} domEventName
 */
export function getEventPriority(domEventName) {
  switch (domEventName) {
    case 'click':
      return DiscreteEventPriority;
    case 'drag':
      return ContinuousEventPriority;
    default:
      return DefaultEventPriority;
  }
}