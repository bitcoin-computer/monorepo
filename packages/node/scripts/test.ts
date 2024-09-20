#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import { spawnSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

const parser = new ArgumentParser()

const testTypeGroup = parser.add_mutually_exclusive_group()
testTypeGroup.add_argument('-s', '--single', { action: 'store' })
testTypeGroup.add_argument('-i', '--integration', { action: 'store_true' })
testTypeGroup.add_argument('-u', '--unit', { action: 'store_true', default: true })
testTypeGroup.add_argument('-sync', '--synchronize', { action: 'store_true' })

const args = parser.parse_args()

let command = `mocha --config `

if (args.integration) {
  command = `${command} .mocharc-async.json`
} else if (args.single) {
  command = `${command} .mocharc-single.json ${args.single}`
} else if (args.synchronize) {
  command = `${command} .mocharc-sync.json`
} else {
  command = `${command} .mocharc-unit.json`
}

const childProcess = spawnSync(command, { shell: true, stdio: 'inherit' })

// Check for errors and log them
if (childProcess.error) {
  console.error(childProcess.error.message)
  process.exit(1)
}

// Check the exit code of the child process
if (childProcess.status === 0) {
  console.log('Command completed successfully.')
} else {
  console.error(`Command failed with code ${childProcess.status}`)
  process.exit(1)
}
// If we get here, the command succeeded
