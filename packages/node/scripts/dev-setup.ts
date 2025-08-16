#!/usr/bin/env node
// Copyright (c) 2021-2023 Bitcoin Computer developers
// Distributed under the MIT software license.

import { ArgumentParser } from 'argparse'
import { spawnSync } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

const parser = new ArgumentParser()

const chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", { action: "store_const", dest: "chain", constant: 'BTC' })
chainGroup.add_argument("-ltc", "--litecoin", { action: "store_const", dest: "chain", constant: 'LTC' })
chainGroup.add_argument("-pepe", "--pepecoin", { action: "store_const", dest: "chain", constant: 'PEPE' })
chainGroup.add_argument("-b1t", "--b1tcoin", { action: "store_const", dest: "chain", constant: 'B1T' })
parser.set_defaults({ chain: 'LTC' })

const networkGroup = parser.add_mutually_exclusive_group()
networkGroup.add_argument("-t", "--testnet", { action: "store_const", dest: "network", constant: 'testnet' })
networkGroup.add_argument("-m", "--mainnet", { action: "store_const", dest: "network", constant: 'mainnet' })
networkGroup.add_argument("-r", "--regtest", { action: "store_const", dest: "network", constant: 'regtest' })
parser.set_defaults({ network: 'regtest' })

const args = parser.parse_args()

let nodePort: String;

switch (args.chain) {
  case 'BTC':
    nodePort = '8332'
    break
  case 'PEPE':
    nodePort = '18332'
    break
  case 'B1T':
    nodePort = '22218'
    break
  default: // LTC
    nodePort = '19332'
    break
}

const bcnPort = process.env.PORT || '1031'
const rpcUser = process.env.RPC_USER || 'bcn-admin'
const rpcPassword = process.env.RPC_PASSWORD || 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='

const command = `BCN_ENV=dev CHAIN=${args.chain} NETWORK=${args.network} POSTGRES_HOST=127.0.0.1 RPC_HOST=127.0.0.1 RPC_PORT=${nodePort} RPC_PROTOCOL=http RPC_USER=${rpcUser} RPC_PASSWORD=${rpcPassword} ZMQ_URL=tcp://127.0.0.1:28332 BCN_URL=http://127.0.0.1:${bcnPort} node --loader ts-node/esm $(grep START_PATH .package.paths | cut -d '=' -f2)`

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
