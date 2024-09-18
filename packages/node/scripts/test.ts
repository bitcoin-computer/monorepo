#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import { spawnSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

const parser = new ArgumentParser()
const chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument('-btc', '--bitcoin', { action: 'store_true' })
chainGroup.add_argument('-ltc', '--litecoin', { action: 'store_true', default: true })
chainGroup.add_argument('-pepe', '--pepecoin', { action: 'store_true' })

const connectionGroup = parser.add_mutually_exclusive_group()
connectionGroup.add_argument('-l', '--local', { action: 'store_true', default: true })
connectionGroup.add_argument('-c', '--cloud', { action: 'store_true' })

const testTypeGroup = parser.add_mutually_exclusive_group()
testTypeGroup.add_argument('-s', '--single', { action: 'store' })
testTypeGroup.add_argument('-i', '--integration', { action: 'store_true' })
testTypeGroup.add_argument('-u', '--unit', { action: 'store_true', default: true })
testTypeGroup.add_argument('-sync', '--synchronize', { action: 'store_true' })

const args = parser.parse_args()

let port = 19332; // LTC

if (args.bitcoin) {
  port = 8332
} else if (args.pepecoin) {
  port = 18332
}

const chain = process.env.CHAIN || (args.bitcoin ? 'BTC' : args.pepecoin ? 'PEPE' : 'LTC')

const network = process.env.NETWORK || 'regtest'
const bcnPort = process.env.PORT ?? '1031'

const nodeUrl = args.cloud ? 'https://rltc.node.bitcoincomputer.io' : `http://127.0.0.1:${bcnPort}`
const postgresHost = process.env.POSTGRES_HOST || '127.0.0.1'
const rpcHost = args.cloud ? 'rltc.node.bitcoincomputer.io' : process.env.RPC_HOST

const rpcUser = process.env.RPC_USER ?? 'bcn-admin'
const rpcPass = process.env.RPC_PASSWORD ?? 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
const zmqUrl = 'tcp://127.0.0.1:28332'

let command = `BCN_URL=${nodeUrl} BCN_CHAIN=${chain} BCN_NETWORK=${network} BCN_ENV=test POSTGRES_PORT=5432 POSTGRES_HOST=${postgresHost} BITCOIN_RPC_HOST=${rpcHost} BITCOIN_RPC_PORT=${port} BITCOIN_RPC_PROTOCOL=http BITCOIN_RPC_USER=${rpcUser} BITCOIN_RPC_PASSWORD=${rpcPass} BCN_ZMQ_URL=${zmqUrl} mocha --config`

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
