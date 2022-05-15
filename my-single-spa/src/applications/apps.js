import { NOT_LOADED, toName } from './app.helpers'

const apps = []

/**
 * @Author: wyb
 * @Descripttion: 注册应用
 * @param appNameOrConfig 应用名
 * @param appOrLoadApp 应用加载函数
 * @param activeWhen 应用加载时机
 * @param customProps 应用接收的数据
 */
export function registerApplication(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  // 格式化参数
  const registration = sanitizeArguments(
    appNameOrConfig, // string
    appOrLoadApp, // function
    activeWhen, // function
    customProps
  )

  // 检查应用是否注册过
  if (getAppNames().includes(registration.name))
    throw new Error(
      `There is already an app registered with name ${registration.name}`
    )

  // 加入到全局 apps 中去
  apps.push(
    Object.assign(
      {
        loadErrorTime: null,
        status: NOT_LOADED,
        parcels: {},
        devtools: {
          overlays: {
            options: {},
            selectors: []
          }
        }
      },
      registration
    )
  )
}

/**
 * @Author: wyb
 * @Descripttion: 格式化参数
 * @param appNameOrConfig 应用名
 * @param appOrLoadApp 应用加载函数
 * @param activeWhen 应用加载时机
 * @param customProps 应用接收的数据
 */
function sanitizeArguments(
  appNameOrConfig,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  // 初始化默认值
  const registration = {
    name: null,
    loadApp: null,
    activeWhen: null,
    customProps: null
  }

  // 如果第一个参数是一个对象 就直接使用第一个对象作为配置
  if (typeof appNameOrConfig === 'object') {
    validateRegisterWithConfig(appNameOrConfig)
    const { name, app, activeWhen, customProps } = appNameOrConfig
    Object.assign(registration, {
      name,
      loadApp: app,
      activeWhen,
      customProps
    })
  } else {
    validateRegisterWithArguments(
      appNameOrConfig,
      appOrLoadApp,
      activeWhen,
      customProps
    )
    Object.assign(registration, {
      name: appNameOrConfig,
      loadApp: appOrLoadApp,
      activeWhen,
      customProps
    })
  }

  // 格式化
  Object.assign(registration, {
    loadApp: sanitizeLoadApp(registration.loadApp),
    activeWhen: sanitizeActiveWhen(registration.activeWhen),
    customProps: registration.customProps || {}
  })

  return registration
}

/**
 * @Author: wyb
 * @Descripttion: 验证传入的配置是否符合要求(对象配置)
 * @param config
 */
function validateRegisterWithConfig(config) {
  // 1.config不能是 数组 或 null
  // 2.config只接受这四种属性 ["name", "app", "activeWhen", "customProps"]
  // 3.name属性必须是 string 且 length > 0
  // 4.app属性必须是 对象 或 函数
  // 5.activeWhen属性比如是 字符串 或 函数 或 数组[字符串|函数]
  // 6.customProp属性必须是 undefined 或 对象(非null或数组)
}

/**
 * @Author: wyb
 * @Descripttion: 验证传入的配置是否符合要求(参数配置)
 * @param name 应用名
 * @param appOrLoadApp 应用加载函数
 * @param activeWhen 应用加载时机
 * @param customProps 应用接收的数据
 */
function validateRegisterWithArguments(
  name,
  appOrLoadApp,
  activeWhen,
  customProps
) {
  // 1.name属性必须是 string 且 length > 0
  // 2.appOrLoadApp 必须为真
  // 3.activeWhen 必须是个函数
  // 4.customProp属性必须是 undefined 或 对象(非null或数组)
}

/**
 * @Author: wyb
 * @Descripttion: 将 loadApp 格式化为函数
 * @param loadApp 加载函数
 */
function sanitizeLoadApp(loadApp) {
  if (typeof loadApp !== 'function') return () => Promise.resolve(loadApp)
  return loadApp
}

/**
 * @Author: wyb
 * @Descripttion: 将 activeWhen 处理成一个函数 (location) => activeWhenArray.some((activeWhen) => activeWhen(location));
 * @param activeWhen 加载时机
 */
function sanitizeActiveWhen(activeWhen) {
  const activeWhenArray = Array.isArray(activeWhen) ? activeWhen : [activeWhen]
  // todo 处理数组
  return location => activeWhenArray.some(activeWhen => activeWhen(location))
}

/**
 * @Author: wyb
 * @Descripttion:
 */
export function getAppNames() {
  return apps.map(toName)
}
