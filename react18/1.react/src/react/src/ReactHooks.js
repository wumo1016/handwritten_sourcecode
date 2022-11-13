import ReactCurrentDispatcher from './ReactCurrentDispatcher'

function resolveDispatcher() {
  return ReactCurrentDispatcher.current
}

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} reducer 处理函数，用于根据老状态和动作计算新状态
 * @param {*} initialArg 初始状态
 */
export function useReducer(reducer, initialArg) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer, initialArg)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} reducer
 * @param {*} initialArg
 */
export function useState(initialState) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} createFn
 * @param {*} deps
 */
export function useEffect(createFn, deps) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useEffect(createFn, deps)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} create
 * @param {*} deps
 */
export function useLayoutEffect(create, deps) {
  const dispatcher = resolveDispatcher()
  return dispatcher.useLayoutEffect(create, deps)
}
