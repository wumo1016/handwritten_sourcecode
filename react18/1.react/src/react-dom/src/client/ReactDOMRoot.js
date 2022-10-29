import {
  createContainer,
  updateContainer
} from 'react-reconciler/src/ReactFiberReconciler'
import { listenToAllSupportedEvents } from 'react-dom-bindings/src/events/DOMPluginEventSystem'

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot
}
ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot
  root.containerInfo.innerHTML = ''
  updateContainer(children, root)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} container div#root
 */
export function createRoot(container) {
  const root = createContainer(container) // FiberRootNode
  listenToAllSupportedEvents(container)
  return new ReactDOMRoot(root)
}
