/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} subscriptions
 * @param {*} callback
 */
export function addSubscription(subscriptions, callback) {
  subscriptions.push(callback)

  const removeSubscription = () => {
    let idx = subscriptions.indexOf(callback)
    if (idx > -1) {
      subscriptions.splice(idx, 1)
    }
  }
  return removeSubscription
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} subscriptions
 * @param {array} args
 */
export function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice(0).forEach(subscribe => subscribe(...args))
}
