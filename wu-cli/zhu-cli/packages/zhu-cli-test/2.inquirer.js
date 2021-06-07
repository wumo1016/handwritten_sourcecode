const inquirer = require('inquirer')
const isManualMode = answers => answers.preset === '__manual__';
//默认的驴肉
let defaultPreset = {
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
let presets = {
    'default': Object.assign({ vueVersion: '2' }, defaultPreset),//vue2
    '__default_vue_3__': Object.assign({ vueVersion: '3' }, defaultPreset)
}
const presetChoices = Object.entries(presets).map(([name]) => {
    let displayName = name
    if (name === 'default') {
        displayName = 'Default'
    } else if (name === '__default_vue_3__') {
        displayName = 'Default (Vue 3)'
    }
    return {
        name: `${displayName}`,
        value: name
    }
})
//presetChoices=[{name:'Default',value:'default'},{name:'Default (Vue 3)'，value:'__default_vue_3__'}]
const presetPrompt = {
    name: 'preset',//弹出项的名称 preset
    type: 'list',//如何选择 列表
    message: `Please pick a preset:`,//请选择一个预设
    choices: [
        ...presetChoices,
        {
            name: 'Manually select features',//手工选择特性
            value: '__manual__'
        }
    ]
}
let features = [
    'vueVersion',
    'babel',
    'typescript',
    'pwa',
    'router',
    'vuex',
    'cssPreprocessors',
    'linter',
    'unit',
    'e2e'
];
const featurePrompt = {
    name: 'features',//弹出项的名称 features 手工选择的特性
    when: isManualMode,//如果when这个函数的返回值是true,就会弹出这个框，否则不弹这个框
    type: 'checkbox',//复选框
    message: 'Check the features needed for your project:',//手工你这个项目支持的特性
    choices: features
}
const prompts = [
    presetPrompt,//描述如何选预设的
    featurePrompt//描述如何选择特性的
]

;(async function(){
 let result = await inquirer.prompt(prompts);
 console.log(result);
})();