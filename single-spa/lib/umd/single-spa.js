(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
})(this, (function (exports) { 'use strict';

  // 描述应用的整个状态
  const NOT_LOADED = 'NOT_LOADED'; // 应用初始状态
  const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'; // 加载资源
  const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'; // 还没有调用bootstrap方法
  const BOOTSTRAPPING = 'BOOTSTRAPPING'; // 启动中
  const NOT_MOUNTED = 'NOT_MOUNTED'; // 没有调用mount方法
  const MOUNTING = 'MOUNTING'; // 正在挂载中
  const MOUNTED = 'MOUNTED'; // 挂载完毕
  const UNMOUNTING = 'UNMOUNTING'; // 解除挂载

  // 当前这个应用是否要被激活 
  // 如果返回true 那么应用应该就开始初始化等一系列操作
  function shouldBeActive(app) {
    return app.activeWhen(window.location)
  }

  async function toBootstarpPromise(app) {
    if (app.status !== NOT_BOOTSTRAPPED) return app
    app.status = BOOTSTRAPPING;
    await app.bootstrap(app.customProps);
    app.status = NOT_MOUNTED;
    return app
  }

  /**
   * @Author: wyb
   * @Descripttion: 加载应用
   * @param {*} app
   */
  async function toLoadPromise(app) {
    app.status = LOADING_SOURCE_CODE;
    const { bootstrap, mount, unmount } = await app.loadApp(app.customProps);
    app.status = NOT_BOOTSTRAPPED; // 没有调用bootstrap方法
    Object.assign(app, {
      bootstrap: flatFnArray(bootstrap),
      mount: flatFnArray(mount),
      unmount: flatFnArray(unmount)
    });
    return app
  }
  /**
   * @Author: wyb
   * @Descripttion: 多个方法组合成一个函数
   * @param {*} fns
   */
  function flatFnArray(fns) {
    fns = Array.isArray(fns) ? fns : [fns];
    return props =>
      fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
  }

  async function toMountPromise(app) {
    if (app.status !== NOT_MOUNTED) return app
    app.status = MOUNTING;
    await app.mount(app.customProps);
    app.status = MOUNTED;
    return app
  }

  async function toUnmountPromise(app) {
    // 如果应用没有被挂载 则不需要卸载
    if (app.status !== MOUNTED) {
      return app
    }
    app.status = UNMOUNTING; // 卸载中
    await app.unmount(app.customProps);
    app.status = NOT_MOUNTED;
    return app
  }

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

    if (started) {
      // 调用start
      return performAppChanges(appsToUnmount, appsToLoad, appsToMount)
    } else {
      // 调用register
      // 注册应用时 需要预先加载
      return loadApps(appsToLoad)
    }
  }

  /**
   * @Descripttion: 根据路径来装载
   * @param {*}
   */
  async function performAppChanges(appsToUnmount, appsToLoad, appsToMount) {
    // 先卸载不需要的应用
    appsToUnmount.map(toUnmountPromise);
    // 装载需要的应用 加载 => 启动 => 挂载
    appsToLoad.map(async app => {
      app = await toLoadPromise(app);
      app = await toBootstarpPromise(app);
      return await toMountPromise(app)
    });
    appsToMount.map(async app => {
      app = await toBootstarpPromise(app);
      return await toMountPromise(app)
    });
  }

  /**
   * @Descripttion: 预加载应用
   * @param {*}
   */
  async function loadApps(appsToLoad) {
    await Promise.all(appsToLoad.map(toLoadPromise)); // 获取到 bootstrap mount unmount 方法 放到app上
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
    reroute(); // 预加载应用
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
