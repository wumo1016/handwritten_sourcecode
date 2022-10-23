import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const resolve = (p) => path.posix.resolve(p)

export default defineConfig({
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      react: path.posix.resolve('src/react'),
      'react-dom': path.posix.resolve('src/react-dom'),
      'react-dom-bindings': path.posix.resolve('src/react-dom-bindings'),
      'react-reconciler': path.posix.resolve('src/react-reconciler'),
      scheduler: path.posix.resolve('src/scheduler'),
      shared: path.posix.resolve('src/shared')
    }
  },
  plugins: [react()],
  optimizeDeps: {
    force: true
  }
})
