/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 * @param {*} eventType
 * @param {*} listener
 */
export function addEventCaptureListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, true)
  return listener
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} target
 * @param {*} eventType
 * @param {*} listener
 */
export function addEventBubbleListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, false)
  return listener
}
