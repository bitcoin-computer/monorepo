#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.

import argparse
import subprocess
import multiprocessing

def runSync(args, commandLine):
    numWorkers = 1
    if(args.cpus is None):
        cpus = multiprocessing.cpu_count()
    else:
        cpus = args.cpus

    # We reserve 2 cpus, one for the db-service, one for the node-service
    if cpus - 2 > 0:
        numWorkers = cpus - 2   

    standardTxCommand = 'true '
    print('Launching '+str(numWorkers)+' workers. ')
    for workerId in range(numWorkers):  
        standardTxCommand+=' && export WORKER_ID='+str(workerId+1)+' NUM_WORKERS='+str(numWorkers)+'; '+ commandLine+' run -d sync'
    
    print(standardTxCommand)
    parallelCommand = standardTxCommand 
    p = subprocess.run(
        ['sh', '-c', parallelCommand], ) 

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

    args = parser.parse_args()

    print(args)

    port = subprocess.check_output("grep -w PORT .env | cut -d '=' -f2", shell=True).decode("utf-8").strip()
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
        bcnUrl = url if url != '' else 'https://rltc.node.bitcoincomputer.io'
        
        subprocess.run(
            ['sh', '-c', commandLine+' run -d -e BCN_URL='+bcnUrl+' -p {0}:{0} bcn'.format(bcnPort)]) 
        # If any service is specified, don't launch sync services
        if(args.service.strip() == ''):
            runSync(args, commandLine)
if __name__ == '__main__':
    main()
    
