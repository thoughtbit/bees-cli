import chalk from 'chalk'
import { format } from 'util'

/**
 * Prefix.
 */

const prefix = '   bees-cli'
const sep = chalk.gray('·')

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

function log () {
  const msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

function fatal (message) {
  if (message instanceof Error) message = message.message.trim()
  const msg = format.apply(format, arguments)
  console.error(chalk.red(prefix), sep, msg)
  process.exit(1)
}

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

function success () {
  const msg = format.apply(format, arguments)
  console.log(chalk.white(prefix), sep, msg)
}

export default {
  log,
  fatal,
  success
}
