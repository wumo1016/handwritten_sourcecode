const { createServer } = require('./server')

;(async function () {
  const server = await createServer()
  server.listen(1016, () => console.log('server started on 1016'))
})()
