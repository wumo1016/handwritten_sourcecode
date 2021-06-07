const path = require('path');//处理路径的
const fs = require('fs');//读写文件的
const ejs = require('ejs');//渲染模板的
const globby = require('globby')//根据模式字符串匹配文件名
const slash = require('slash')//把路径里的\ 转成 /的
const { isBinaryFileSync } = require('isbinaryfile');
let source = path.join(__dirname, 'template');//模板目录 
;(async function () {
    // **/* 匹配任意目录下面的任意文件
    const _files = await globby(['**/*'], { cwd: source })
    let files = {};
    for (const rawPath of _files) {
        debugger
        const sourcePath = slash(path.resolve(source, rawPath))//每个文件的绝对路径
        if(isBinaryFileSync(sourcePath)){
            const content = fs.readFileSync(sourcePath)//读取这个模板
            files[sourcePath] = content;
        }else{
            const template = fs.readFileSync(sourcePath, 'utf8')//读取这个模板
            const content = ejs.render(template, {
                rootOptions: { vueVersion: '3' }
            })
            files[sourcePath] = content;
        }
       
    }
    console.log(files);
})();
