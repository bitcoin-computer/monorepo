#!/usr/bin/env node
import { ArgumentParser } from 'argparse'
import { availableParallelism } from 'os';
import { execSync } from 'child_process'
import 'dotenv/config'

// function runSync(commandLine) {
//   // let numWorkers = Math.max(Math.floor(require('os').cpus().length - 2), 1); // Reserve 2 CPUs
//   let numWorkers = Math.max(Math.floor(availableParallelism() - 2), 1); // Reserve 2 CPUs availableParallelism()
//   if (numWorkers < 1) {
//     console.log('Warning: No CPUs available for workers.')
//     numWorkers = 2
//   }
//   // TODO REMOVE
//   numWorkers = 4
//   console.log(`Launching ${numWorkers} workers.`);
//   let workersCommand = commandLine
//   for (let workerId = 0; workerId < numWorkers; workerId++) {
//     workersCommand += ` && export BCN_WORKER_ID=${workerId + 1} BCN_NUM_WORKERS=${numWorkers}; docker compose -f docker-compose.yml run -d sync`;
//   }
//   console.log(workersCommand)
//   const parallelCommand = workersCommand;
//   // spawn('sh', ['-c', parallelCommand]);
//   execSync(`sh -c "${parallelCommand}"`, { stdio: 'inherit' })
// }


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

  // Determine the service to launch
  const args = parser.parse_args()
  const selectedService = args.db || args.bcn || args.node || args.sync
  
  const commandLine = `docker compose -f docker-compose.yml `

  // if (selectedService) {
  //   // Run the selected service. If -sync is selected, run the sync service with the number of available cores
  //   if(selectedService === 'sync') {
  //     runSync(commandLine)
  //   } else {
  //     console.log(`Launching all services ${commandLine}`)
  //     execSync(`sh -c "${commandLine} up ${selectedService}"`, { stdio: 'inherit' })
  //   }
  // } else {
    // Run all services. Launch bcn + node + db and then spawn sync processes
    //execSync(`sh -c "${commandLine} up bcn node db"`, { stdio: 'inherit' })
    // runSync(commandLine)
  // }

  execSync(`sh -c "${commandLine} up ${selectedService || ''}"`, { stdio: 'inherit' })
}

main()
