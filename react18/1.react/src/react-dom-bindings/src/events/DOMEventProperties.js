import { registerTwoPhaseEvent } from './EventRegistry'
const simpleEventPluginEvents = ['click']

// 原生事件和react事件的映射
export const topLevelEventsToReactNames = new Map() // click => onClick
/**
 * @Author: wyb
 * @Descripttion: 遍历事件，处理事件名，并注册简单事件
 */
export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i] // click
    const domEventName = eventName.toLowerCase() // click
    const capitalizeEvent = eventName[0].toUpperCase() + eventName.slice(1) // Click
    registerSimpleEvent(domEventName, `on${capitalizeEvent}`) // click, onClick
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} domEventName
 * @param {*} reactName
 */
function registerSimpleEvent(domEventName, reactName) {
  //onClick在哪里可以取到
  //workInProgress.pendingProps=React元素或者说虚拟DOM.props
  //const newProps = workInProgress.pendingProps;
  //在源码里 让真实DOM元素   updateFiberProps(domElement, props);
  //const internalPropsKey = "__reactProps$" + randomKey;
  //真实DOM元素[internalPropsKey] = props; props.onClick
  //把原生事件名和处理函数的名字进行映射或者说绑定，click=>onClick
  topLevelEventsToReactNames.set(domEventName, reactName)
  registerTwoPhaseEvent(reactName, [domEventName]) // 'onClick' ['click']
}
