#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.

import argparse
import subprocess
from subprocess import Popen
import multiprocessing

def runSync(args, commandLine):
    if(args.cpus is not None):
        # numWorkers = cpus - db, node + nonSt
        numWorkers = args.cpus - 3 if args.cpus - 3 > 0 else 1
    else:
        numWorkers = multiprocessing.cpu_count() - 3 if multiprocessing.cpu_count() - 3 > 0 else 1

    standardTxCommand = ''
    print('Launching '+str(numWorkers+1)+' workers.')
    for worker in range(numWorkers):  
        standardTxCommand+=syncCommandLine('false', str(worker+1), str(numWorkers), commandLine)+ ' && '
    
    nonStandardTxCommand = syncCommandLine('true', str(numWorkers+1), '1', commandLine)

    parallelCommand = standardTxCommand + nonStandardTxCommand
    p = subprocess.run(
        ['sh', '-c', parallelCommand], ) 

def syncCommandLine(nonStandard, workerId, numWorkers, commandLine):
    if (nonStandard == 'true'):
        return 'export SYNC_NON_STANDARD='+nonStandard+' WORKER_ID='+str(workerId)+' ; '+ commandLine+' run -d sync'
    else:
        return 'export SYNC_NON_STANDARD='+nonStandard+' WORKER_ID='+str(workerId)+' NUM_WORKERS='+str(numWorkers)+'; '+ commandLine+' run -d sync'

def main():
    
    parser = argparse.ArgumentParser()
    chainGroup = parser.add_mutually_exclusive_group()
    chainGroup.add_argument("-btc", "--bitcoin", action="store_const", dest="chain", const='btc')
    chainGroup.add_argument("-ltc", "--litecoin", action="store_const", dest="chain", const='ltc')
    parser.set_defaults(chain='ltc')

    networkGroup = parser.add_mutually_exclusive_group()
    networkGroup.add_argument("-t", "--testnet", action="store_const", dest="network", const='testnet')
    networkGroup.add_argument("-m", "--mainnet", action="store_const", dest="network", const='mainnet')
    networkGroup.add_argument("-r", "--regtest", action="store_const", dest="network", const='regtest')
    parser.set_defaults(network='regtest')

    serviceGroup = parser.add_mutually_exclusive_group()
    serviceGroup.add_argument('-db', action="store_const", dest="service", const='db')
    serviceGroup.add_argument('-bcn', action="store_const", dest="service", const='bcn')
    serviceGroup.add_argument('-node', action="store_const", dest="service", const='node')

    parser.set_defaults(service='')

    parser.add_argument('-cpus', dest="cpus",type=int)
    parser.add_argument('-optimize', action="store_true")

    args = parser.parse_args()

    print(args)

    port = subprocess.check_output("grep PORT .env | cut -d '=' -f2", shell=True).decode("utf-8").strip()
    bcnPort = port if port != '' else '1031'

    commandLine = ' docker compose -f docker-compose.yml -f chain-setup/'+args.chain+'-'+args.network+'/docker-compose-local-'+args.chain+'-'+args.network+'.yml '

    print(commandLine)
    # ltc and regtest are the default
    
    if(args.network == 'regtest'):
        subprocess.run(
            ['sh', '-c', commandLine+' up {0}'.format(args.service)]) 
    else:
        # testnet or mainnet
        url = subprocess.check_output("grep BCN_URL .env | cut -d '=' -f2", shell=True).decode("utf-8").strip()
        bcnUrl = url if url != '' else 'https://node.bitcoincomputer.io'
        if(args.optimize):
            # Optimize for speed: skip launching bcn service (no port binding)
            subprocess.run(
                ['sh', '-c', commandLine+' run -d -e BCN_URL='+bcnUrl+' bcn']) 
            # Launch sync in automatic parallel mode. If any service is specified, don't launch sync services
            if(args.service.strip() == ''):
                runSync(args, commandLine)
        else:
            subprocess.run(
                ['sh', '-c', commandLine+' run -d -e BCN_URL='+bcnUrl+' -p {0}:{0} bcn'.format(bcnPort)]) 
            # If any service is specified, don't launch sync services
            if(args.service.strip() == ''):
                runSync(args, commandLine)
if __name__ == '__main__':
    main()
    