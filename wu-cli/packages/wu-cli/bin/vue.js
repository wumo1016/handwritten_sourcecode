#!/usr/bin/env node

const program = require('commander')

program
  .version('wu-cli 0.0.0')
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by wu-cli-vervice')
  .action(appName => {
    console.log(appName);
  })

program.parse(process.argv)
