
let path = require('path');
let  {getPromptModules} = require('./util/createTools') ;
let Creator= require('./Creator');
/**
 * 创建项目
 * @param {}} projectName  项目的名称
 */
async function create(projectName){
  let cwd = process.cwd();//获取 当前的工作目录 
  let name = projectName;//项目名
  let targetDir = path.resolve(cwd,name)
  //获取要弹出的选项
  let promptModules = getPromptModules();
  console.log(promptModules);
  const creator  = new Creator(name,targetDir,promptModules);
  await creator.create();
}
module.exports = (...args)=>{
   return create(...args).catch(err=>{
       console.log(err);
   });
}