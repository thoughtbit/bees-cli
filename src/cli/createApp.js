import path from 'path'
import { existsSync } from 'fs'
import os from 'os'
import rimraf from 'rimraf'
import uid from 'uid'
import ora from 'ora'
import download from 'download-git-repo'
import chalk from 'chalk'
import inquirer from 'inquirer'
import logger from './../utils/logger'
import checkVersion from './../utils/checkVersion'
import generate from './../utils/generate'

const argv = require('yargs')
  .usage('Usage: bees init [options]')
  .option('clone', {
    type: 'boolean',
    alias: 'c',
    describe: 'use git clone',
    default: false
  })
  .help('h')
  .argv

function printUsageAndExit () {
  console.log(
`${chalk.gray('==========================================================================\n')}
Usage:
    bees init ${chalk.gray('<template-name> [project-name]')}

Options:

    -h, --help   output usage information
    -c, --clone  use git clone

Examples:
${chalk.gray('    # create a new project with an official template')}
    $ bees init webpack my-project
  
${chalk.gray('    # create a new project straight from a github template')}
    $ bees init username/repo my-project
${chalk.gray('\n==========================================================================')}
`)
  process.exit(0)
}

/**
 * Help.
 */

function help () {
  if (argv._.length === 0 || argv.h === true) {
    printUsageAndExit()
  }
}
help()

/**
 * Padding.
 */

console.log()
process.on('exit', function () {
  console.log()
})

/**
 * Settings.
 */

const template = argv._[0]
const hasSlash = template.indexOf('/') > -1
const rawName = argv._[1]
const inPlace = !rawName || rawName === '.'
const name = inPlace ? path.relative('../', process.cwd()) : rawName
const to = path.resolve(rawName || '.')
const clone = argv.clone || false

if (existsSync(to)) {
  inquirer.prompt([{
    type: 'confirm',
    message: inPlace ? '您确定要在当前目录生成项目吗?' : `您要创建的 ${chalk.red(`${rawName}`)} 项目已经存在了. 继续吗?`,
    name: 'ok'
  }], function (answers) {
    if (answers.ok) {
      run()
    }
  })
} else {
  run()
}

/**
 * Check, download and generate the project.
 */

function run () {
  // check if template is local
  if (/^[./]|(\w:)/.test(template)) {
    const templatePath = template.charAt(0) === '/' || /^\w:/.test(template)
      ? template
      : path.normalize(path.join(process.cwd(), template))
    if (existsSync(templatePath)) {
      generate(name, templatePath, to, function (err) {
        if (err) logger.fatal(err)
        console.log()
        logger.success('Generated "%s".', name)
      })
    } else {
      logger.fatal('Local template "%s" not found.', template)
    }
  } else {
    checkVersion(function () {
      if (!hasSlash) {
        // use official templates
        const officialTemplate = 'fis-templates/' + template
        downloadAndGenerate(officialTemplate)
      } else {
        downloadAndGenerate(template)
      }
    })
  }
}

/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate (template) {
  const tmp = os.tmpdir() + '/fis-template-' + uid()
  const spinner = ora('Downloading template...')
  spinner.start()
  download(template, tmp, { clone: clone }, function (err) {
    spinner.stop()
    process.on('exit', function () {
      rimraf.sync(tmp)
    })
    if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
    generate(name, tmp, to, function (err) {
      if (err) logger.fatal(err)
      console.log()
      logger.success('Generated "%s".', name)
    })
  })
}
