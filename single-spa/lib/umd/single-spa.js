(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
})(this, (function (exports) { 'use strict';

  let started = false;
  /**
   * @Descripttion: 挂载应用
   * @param {*}
   */
  function start() {
    started = true;
    // 加载并挂载应用
    reroute();
  }

  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*}
   */
  function reroute() {
    // 获取需要加载的应用
    // 获取需要被挂载的应用
    // 获取需要卸载的应用

    const { appsToUnmount, appsToLoad, appsToMount } = getAppChanges();

    console.log(appsToUnmount, appsToLoad, appsToMount);

    if (started) {
      // 调用start
      return performAppChanges()
    } else {
      // 调用register
      // 注册应用时 需要预先加载
      return loadApps()
    }
  }

  /**
   * @Descripttion: 根据路径来装载
   * @param {*}
   */
  async function performAppChanges() {}

  /**
   * @Descripttion: 预加载应用
   * @param {*}
   */
  async function loadApps() {}

  // 描述应用的整个状态
  const NOT_LOADED = 'NOT_LOADED'; // 应用初始状态
  const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'; // 加载资源
  const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'; // 还没有调用bootstrap方法
  const BOOTSTRAPPING = 'BOOTSTRAPPING'; // 启动中
  const NOT_MOUNTED = 'NOT_MOUNTED'; // 没有调用mount方法
  const MOUNTED = 'MOUNTED'; // 挂载完毕

  // 当前这个应用是否要被激活 
  // 如果返回true 那么应用应该就开始初始化等一系列操作
  function shouldBeActive(app) {
    return app.activeWhen(window.location)
  }

  const apps = [];

  /**
   * @Descripttion: 注册应用
   * @param {*} appName 应用名
   * @param {*} loadApp 加载应用的方法
   * @param {*} activeWhen 何时调用 loadApp 方法
   * @param {*} customProps 自定义属性
   */
  function registerApplication(appName, loadApp, activeWhen, customProps) {
    apps.push({
      name: appName,
      loadApp,
      activeWhen,
      customProps,
      status: NOT_LOADED
    });

    reroute(); // 加载应用

    // console.log(apps)
  }

  /**
   * @Descripttion:
   * @param {*}
   */
  function getAppChanges() {
    const appsToUnmount = []; // 需要卸载的app
    const appsToLoad = []; // 需要加载的app
    const appsToMount = []; // 需要挂载的app

    apps.forEach(app => {
      const appShouldBeActive = shouldBeActive(app); // 是否需要挂载
      switch (app.status) {
        case NOT_LOADED:
        case LOADING_SOURCE_CODE:
          if (appShouldBeActive) appsToLoad.push(app);
          break
        case NOT_BOOTSTRAPPED:
        case BOOTSTRAPPING:
        case NOT_MOUNTED:
          if (appShouldBeActive) appsToMount.push(app);
          break
        case MOUNTED:
          if (!appShouldBeActive) appsToUnmount.push(app);
          break
      }
    });
    
    return {
      appsToUnmount,
      appsToLoad,
      appsToMount
    }
  }

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=single-spa.js.map
