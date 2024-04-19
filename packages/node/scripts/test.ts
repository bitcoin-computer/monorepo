#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import { spawnSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

const parser = new ArgumentParser()
const chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument('-btc', '--bitcoin', { action: 'store_true' })
chainGroup.add_argument('-ltc', '--litecoin', { action: 'store_true', default: true })

const networkGroup = parser.add_mutually_exclusive_group()
networkGroup.add_argument('-r', '--regtest', { action: 'store_true', default: true })
networkGroup.add_argument('-t', '--testnet', { action: 'store_true' })

const testTypeGroup = parser.add_mutually_exclusive_group()
testTypeGroup.add_argument('-s', '--single', { action: 'store' })
testTypeGroup.add_argument('-i', '--integration', { action: 'store_true' })
testTypeGroup.add_argument('-u', '--unit', { action: 'store_true', default: true })

const args = parser.parse_args()

const port = args.bitcoin ? 8332 : 19332
const chain = args.bitcoin ? 'BTC' : 'LTC'
const network = args.testnet ? 'testnet' : 'regtest'
const bcnPort = process.env.PORT ?? 1031
const nodeUrl = args.network === 'regtest' ? 'http://127.0.0.1:' + bcnPort : 'https://rltc.node.bitcoincomputer.io'
const postgresHost = '127.0.0.1'
const rpcHost = args.testnet ? 'rltc.node.bitcoincomputer.io' : process.env.RPC_HOST
const rpcUser = process.env.RPC_USER ?? 'bcn-admin'
const rpcPass = process.env.RPC_PASSWORD ?? 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
const zmqUrl = 'tcp://127.0.0.1:28332'
const unP2shUrl = `http://127.0.0.1:${bcnPort}`

let command = `BCN_URL=${nodeUrl} CHAIN=${chain} NETWORK=${network} BCN_ENV=test POSTGRES_PORT=5432 POSTGRES_HOST=${postgresHost} RPC_HOST=${rpcHost} RPC_PORT=${port} RPC_PROTOCOL=http RPC_USER=${rpcUser} RPC_PASSWORD=${rpcPass} ZMQ_URL=${zmqUrl} UN_P2SH_URL=${unP2shUrl} mocha --config`

if (args.integration) {
  command = `${command} .mocharc-async.json`
} else if (args.single) {
  command = `${command} .mocharc-single.json ${args.single}`
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
