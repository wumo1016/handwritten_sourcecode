const ora = require('ora')
const spinner = ora()

exports.logWithSpinner = (msg) => {
  spinner.text = msg // 修改提示文本
  spinner.start(); // 开始动画
}

exports.stopSpinner = () => {
  spinner.stop(); // 停止动画
}

exports.logWithSpinner('npm install');
setTimeout(() => {
  exports.stopSpinner();
}, 3000);