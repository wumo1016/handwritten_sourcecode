const ora = require('ora')
const spinner = ora()

exports.logWithSpinner = (msg) => {
    spinner.text = msg //修改提示文本
    spinner.start();//开始显示转圈 显示进度条
}

exports.stopSpinner = () => {
    spinner.stop();//停止转圈
}

exports.logWithSpinner('npm install');
setTimeout(()=>{
    exports.stopSpinner();
},3000);