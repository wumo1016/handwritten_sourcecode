const path = require('path')
// const vue = require('@vitejs/plugin-vue')

const vue = require('./plugins/plugin-vue')
module.exports = {
  plugins: [vue()]
}
