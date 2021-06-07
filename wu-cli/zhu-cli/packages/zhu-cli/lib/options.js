

exports.defaultPreset = {
    useConfigFiles: false,//是否把babel eslint postcss这些包对应的配置项是否要放在单独的文件,false的话是放在package.json里
    cssPreprocessor: undefined,//默认没有配置css预处理器
    plugins: {
        '@vue/cli-plugin-babel': {},//babel   官方插件的前缀是固定的 @vue/cli-plugin- 
        '@vue/cli-plugin-eslint': {//eslint
            config: 'base',
            lintOn: ['save']//保存的时候进行lint检查 
        }
    }
}
exports.defaults = {
    'default': Object.assign({ vueVersion: '2' }, exports.defaultPreset),//vue2
    '__default_vue_3__': Object.assign({ vueVersion: '3' }, exports.defaultPreset)
}