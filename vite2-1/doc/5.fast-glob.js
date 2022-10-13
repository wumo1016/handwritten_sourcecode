const glob = require('fast-glob')
;(async () => {
  const entries = await glob(['**/*.js'])
  console.log(entries)
})()
