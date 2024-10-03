#!/usr/bin/env node
import { ArgumentParser } from 'argparse'
import { execSync } from 'child_process'
import 'dotenv/config'

function main() {
  if (!process.env) {
    console.error('No .env file found')
    process.exit(1)
  }

  if (!process.env.BCN_CHAIN || !process.env.BCN_NETWORK) {
    console.error('BCN_CHAIN and BCN_NETWORK must be set in the .env file')
    process.exit(1)
  }

  const network: string = process.env.BCN_NETWORK 

  if (network !== 'regtest' && network !== 'testnet' && network !== 'mainnet') {
    console.error('BCN_NETWORK must be set to "regtest", "testnet", or "mainnet"')
    process.exit(1)
  }

  const parser = new ArgumentParser()
  const serviceGroup = parser.add_mutually_exclusive_group()
  serviceGroup.add_argument('-db', { action: 'store_const', const: 'db' })
  serviceGroup.add_argument('-bcn', { action: 'store_const', const: 'bcn' })
  serviceGroup.add_argument('-node', { action: 'store_const', const: 'node' })
  serviceGroup.add_argument('-sync', { action: 'store_const', const: 'sync' })

  parser.add_argument('-threads', { type: 'int' })

  // Determine the service to launch
  const args = parser.parse_args()
  const selectedService = args.db || args.bcn || args.node || args.sync
  
  const threadsString = args.threads !== undefined ? ` export BCN_THREADS=${args.threads} && ` : ''
  const commandLine = `${threadsString} docker compose -f docker-compose.yml `
  
  console.log(commandLine)

  execSync(`sh -c "${commandLine} down ${selectedService || ''}"`, { stdio: 'inherit' })
}

main()
