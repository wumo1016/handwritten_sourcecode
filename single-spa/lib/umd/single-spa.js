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

  /**
   * @Descripttion: 注册应用
   * @param {*} appName 应用名
   * @param {*} loadApp 加载应用的方法
   * @param {*} activeWhen 何时调用 loadApp 方法
   * @param {*} customProps 自定义属性
   */
  function registerApplication(appName, loadApp, activeWhen, customProps) {

    reroute(); // 加载应用

    // console.log(apps)
  }

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=single-spa.js.map
