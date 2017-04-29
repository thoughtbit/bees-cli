import async from 'async'
import inquirer from 'inquirer'
import evaluate from './eval'

// Support types from prompt-for which was used before
const promptMapping = {
  string: 'input',
  boolean: 'confirm'
}

/**
 * Inquirer prompt wrapper.
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function prompt (data, key, prompt, done) {
  // skip prompts whose when condition is not met
  if (prompt.when && !evaluate(prompt.when, data)) {
    return done()
  }

  let promptDefault = prompt.default
  if (typeof prompt.default === 'function') {
    promptDefault = function () {
      return prompt.default.bind(this)(data)
    }
  }

  inquirer.prompt([{
    type: promptMapping[prompt.type] || prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: promptDefault,
    choices: prompt.choices || [],
    validate: prompt.validate || function () { return true }
  }], function (answers) {
    if (Array.isArray(answers[key])) {
      data[key] = {}
      answers[key].forEach(function (multiChoiceAnswer) {
        data[key][multiChoiceAnswer] = true
      })
    } else {
      data[key] = answers[key]
    }
    done()
  })
}

/**
 * Ask questions, return results.
 *
 * @param {Object} prompts
 * @param {Object} data
 * @param {Function} done
 */

function ask (prompts, data, done) {
  async.eachSeries(Object.keys(prompts), function (key, next) {
    prompt(data, key, prompts[key], next)
  }, done)
}

export default ask
