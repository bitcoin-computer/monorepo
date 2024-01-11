#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import { spawnSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config();

const parser = new ArgumentParser()

const chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", { action: "store_true" })
chainGroup.add_argument("-ltc", "--litecoin", { action: "store_true", default: true })

const networkGroup = parser.add_mutually_exclusive_group()
networkGroup.add_argument("-r", "--regtest", { action: "store_true", default: true })
networkGroup.add_argument("-t", "--testnet", { action: "store_true" })

const testTypeGroup = parser.add_mutually_exclusive_group()
testTypeGroup.add_argument("-s", "--single", { action: "store" })
testTypeGroup.add_argument("-i", "--integration", { action: "store_true" })
testTypeGroup.add_argument("-n", "--nakamotojs", { action: "store_true" })
testTypeGroup.add_argument("-u", "--unit", { action: "store_true", default: true })

const testEnvGroup = parser.add_mutually_exclusive_group()
testEnvGroup.add_argument("-b", "--browser", { action: "store_true" })
testEnvGroup.add_argument("-re", "--react", { action: "store_true" })
testEnvGroup.add_argument("-m", "--main", { action: "store_true" })

const args = parser.parse_args()

const nodePort = args.bitcoin ? 8332 : 19332
const chain = args.bitcoin ? 'BTC' : 'LTC'
const network = args.regtest ? 'regtest' : 'testnet'
const bcnPort = process.env.PORT ?? 1031
const bcnUrl = args.regtest ? 'http://127.0.0.1:' + bcnPort : 'https://node.bitcoincomputer.io'
const rpcHost = args.regtest ? '127.0.0.1' : 'node.bitcoincomputer.io'
const rpcUser = 'bcn-admin'
const rpcPass = 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
const testEnv = args.react ? 'react' : args.browser ? 'browser' : args.main ? 'main' : 'source'

const jsDom = testEnv === 'browser' || testEnv === 'react' ? '--require jsdom-global/register' : ''

let command = `TS_NODE_FILES=true 
  RPC_HOST=${rpcHost} 
  RPC_PORT=${nodePort} 
  RPC_PROTOCOL=http  
  RPC_USER=${rpcUser} 
  RPC_PASSWORD=${rpcPass} 
  CHAIN=${chain} 
  NETWORK=${network} 
  BCN_URL=${bcnUrl} 
  TEST_ENV=${testEnv} mocha --exit ${jsDom} --config`

// ltc, regtest, and unit are default

if (args.integration) {
    command = `${command} .mocharc-async.json`
} else if (args.nakamotojs) {
    command = `${command} .mocharc-nakamoto-lib.json`
} else if (args.single) {
    command = `${command} .mocharc-single.json ${args.single}`
} else {
    command = `${command} .mocharc.json --parallel`
}

console.log(command)

// Use spawnSync with stdio: 'inherit' to display output in real-time
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
