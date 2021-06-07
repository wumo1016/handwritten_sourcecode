const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const globby = require('globby') // 字符串匹配文件名
const slash = require('slash') // 转换路径中得反斜杠得 \ => /
const {
  isBinaryFileSync
} = require('isbinaryfile');
let source = path.join(__dirname, 'template');;
(async function () {
  const _files = await globby(['**/*'], {
    cwd: source
  })
  let files = {};
  for (const rawPath of _files) {
    const sourcePath = slash(path.resolve(source, rawPath))
    if (isBinaryFileSync(sourcePath)) {
      const content = fs.readFileSync(sourcePath)
      files[sourcePath] = content;
    } else {
      const template = fs.readFileSync(sourcePath, 'utf8')
      const content = ejs.render(template, {
        rootOptions: {
          vueVersion: '2'
        }
      })
      files[sourcePath] = content;
    }
  }
  console.log(files);
})();