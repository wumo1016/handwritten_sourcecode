const { createServer } = require('./server')

;(async function () {
  const server = await createServer()
  server.listen(1016, () => console.log('Local:   http://127.0.0.1:1016'))
})()
