(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
})(this, (function (exports) { 'use strict';

  // App statuses
  const NOT_LOADED = 'NOT_LOADED';

  /**
   * @Author: wyb
   * @Descripttion: 获取应用名
   * @param app
   */
  const toName = app => app.name;

  const apps = [];

  /**
   * @Author: wyb
   * @Descripttion: 注册应用
   * @param appNameOrConfig 应用名
   * @param appOrLoadApp 应用加载函数
   * @param activeWhen 应用加载时机
   * @param customProps 应用接收的数据
   */
  function registerApplication(
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
    );

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
    );
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
    };

    // 如果第一个参数是一个对象 就直接使用第一个对象作为配置
    if (typeof appNameOrConfig === 'object') {
      const { name, app, activeWhen, customProps } = appNameOrConfig;
      Object.assign(registration, {
        name,
        loadApp: app,
        activeWhen,
        customProps
      });
    } else {
      Object.assign(registration, {
        name: appNameOrConfig,
        loadApp: appOrLoadApp,
        activeWhen,
        customProps
      });
    }

    // 格式化
    Object.assign(registration, {
      loadApp: sanitizeLoadApp(registration.loadApp),
      activeWhen: sanitizeActiveWhen(registration.activeWhen),
      customProps: registration.customProps || {}
    });

    return registration
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
    const activeWhenArray = Array.isArray(activeWhen) ? activeWhen : [activeWhen];
    // todo 处理数组
    return location => activeWhenArray.some(activeWhen => activeWhen(location))
  }

  /**
   * @Author: wyb
   * @Descripttion:
   */
  function getAppNames() {
    return apps.map(toName)
  }

  /**
   * @Descripttion: 启动应用
   * @param {*}
   */
  function start() {}

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=single-spa.js.map
