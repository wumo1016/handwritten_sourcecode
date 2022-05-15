// App statuses
export const NOT_LOADED = 'NOT_LOADED'
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE'
export const NOT_BOOTSTRAPPED = 'NOT_BOOTSTRAPPED'
export const BOOTSTRAPPING = 'BOOTSTRAPPING'
export const NOT_MOUNTED = 'NOT_MOUNTED'
export const MOUNTING = 'MOUNTING'
export const MOUNTED = 'MOUNTED'
export const UPDATING = 'UPDATING'
export const UNMOUNTING = 'UNMOUNTING'
export const UNLOADING = 'UNLOADING'
export const LOAD_ERROR = 'LOAD_ERROR'
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN'

/**
 * @Author: wyb
 * @Descripttion: 获取应用名
 * @param app
 */
export const toName = app => app.name
