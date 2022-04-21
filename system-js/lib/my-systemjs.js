let currentRegister

function SystemJS() {}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.onload = () => {
      const _currentRegister = currentRegister
      // 没有其他依赖
      if (!_currentRegister) {
        resolve([[], function () {}])
      }
      resolve(_currentRegister)
      currentRegister = undefined
      document.head.removeChild(script)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

SystemJS.prototype.import = function (path) {
  return new Promise((resolve, reject) => {
    const baseUrl = window.location.href.slice(
      0,
      window.location.href.lastIndexOf('/')
    )
    if (path.startsWith('.')) {
      resolve(baseUrl + path.slice(1))
    }
  }).then(url => {
    let exec
    return loadScript(url)
      .then(register => {
        function _export() {}
        const { setters, execute } = register[1](_export) // {setters: Array(2), execute: ƒ}
        exec = execute
        return [register[0], setters]
      })
      .then(([deps, setters]) => {
        const imports = loadImports() // { react: url, react-dom: url }
        return Promise.all(
          deps.map((dep, index) => {
            const setter = setters[index]
            const url = imports[dep]
            return loadScript(url).then(res => {
              const p = getLastGlobal()
              p.default = p // 取属性的时候默认都加了default
              if (p) setter(p)
            })
          })
        )
      })
      .then(() => exec())
  })
}

// 将本次声明的以来和声明 暴露到到外部
SystemJS.prototype.register = async function (deps, callback) {
  currentRegister = [deps, callback]
}

function loadImports() {
  const scriptList = document.querySelectorAll('script')
  const target = [...scriptList].find(dom => dom.type === 'systemjs-importmap')
  const { imports } = JSON.parse(target.innerHTML.trim())
  return imports || {}
}

// 获取此刻window上挂载的全局变量
let set = new Set()
function saveGlobalData() {
  for (const key in window) {
    set.add(key)
  }
}
function getLastGlobal() {
  for (const key in window) {
    if (!set.has(key)) {
      set.add(key)
      return window[key]
    }
  }
}
saveGlobalData()

var System = new SystemJS()
