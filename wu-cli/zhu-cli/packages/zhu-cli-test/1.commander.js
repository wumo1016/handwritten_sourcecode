#!/usr/bin/env node
const program = require('commander');
program
    .version(`zhang-cli 0.0.0}`)//可以指定版本号
    .usage('<command> [options]')//可以指定使用方式 命令 参数

program
    .command('create <app-name>') //添加一个命令 create <表示必选参数>
    //vue-cli-service = react-scripts 封装build serve
    .description('create a new project powered by vue-cli-service')
    .action((appName) => {

        //create真正的业务逻辑
        console.log(appName);
    })

program.parse(process.argv)


/**
✨  Creating project in C:\aproject\hello-world. mkdir hello-world
🗃  Initializing git repository...  git init
⚙️  Installing CLI plugins. This might take a while... 安装插件


added 1228 packages, and audited 1229 packages in 3m

67 packages are looking for funding
  run `npm fund` for details

45 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
🚀  Invoking generators... 调用生成器  每个插件都会有一个生成器函数，调用它可以产出文件，或者修改配置
📦  Installing additional dependencies... 安装额外的依赖

⚓  Running completion hooks...

📄  Generating README.md...  生成readme文件

🎉  Successfully created project hello-world.
👉  Get started with the following commands:

 $ cd hello-world
 $ npm run serve
 */