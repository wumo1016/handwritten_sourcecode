// 注册了两个模块 这两个模块加载完毕后回一一调用返回对象中的setters
// 都加载完毕后 就会执行返回对象中的execute方法 方法就是原文件index.js中的逻辑
System.register(
  ['react', 'react-dom'],
  function (__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
    var __WEBPACK_EXTERNAL_MODULE_react__ = {}
    var __WEBPACK_EXTERNAL_MODULE_react_dom__ = {}
    Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_react__, '__esModule', {
      value: true
    })
    Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_react_dom__, '__esModule', {
      value: true
    })
    return {
      setters: [
        function (module) {
          Object.keys(module).forEach(function (key) {
            __WEBPACK_EXTERNAL_MODULE_react__[key] = module[key]
          })
        },
        function (module) {
          Object.keys(module).forEach(function (key) {
            __WEBPACK_EXTERNAL_MODULE_react_dom__[key] = module[key]
          })
        }
      ],
      execute: function () {
        __WEBPACK_DYNAMIC_EXPORT__(
          (() => {
            'use strict'
            var modules = {
              './src/index.js': (module, exports, require) => {
                eval(
                  'require.r(exports);\n var react__WEBPACK_IMPORTED_MODULE_0__ = require( "react");\n var react_dom__WEBPACK_IMPORTED_MODULE_1__ = require( "react-dom");\n\n\nreact_dom__WEBPACK_IMPORTED_MODULE_1__["default"].render( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__["default"].createElement("h1", null, "hello zf1"), document.getElementById(\'root\'));\n\n//# sourceURL=webpack://system-imp/./src/index.js?'
                )
              },
              react: module => {
                module.exports = __WEBPACK_EXTERNAL_MODULE_react__
              },
              'react-dom': module => {
                module.exports = __WEBPACK_EXTERNAL_MODULE_react_dom__
              }
            }
            var cache = {}
            function require(moduleId) {
              var cachedModule = cache[moduleId]
              if (cachedModule !== undefined) {
                return cachedModule.exports
              }
              var module = (cache[moduleId] = {
                exports: {}
              })
              modules[moduleId](module, module.exports, require)
              return module.exports
            }
            ;(() => {
              require.r = exports => {
                if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                  Object.defineProperty(exports, Symbol.toStringTag, {
                    value: 'Module'
                  })
                }
                Object.defineProperty(exports, '__esModule', { value: true })
              }
            })()
            var exports = require('./src/index.js')
            return exports
          })()
        )
      }
    }
  }
)
