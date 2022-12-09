#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.

import argparse
import json
import pty
import subprocess
from subprocess import Popen
import multiprocessing
from aws import EXPORT_CREDENTIALS

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


    cloudGroup = parser.add_mutually_exclusive_group()
    cloudGroup.add_argument("--aws", action="store_const", dest="cloud", const='aws')
    cloudGroup.add_argument("--local", action="store_const", dest="cloud", const='local')
    cloudGroup.add_argument('--convert', action="store_const", dest="cloud", const='convert')

    parser.set_defaults(cloud='local')

    serviceGroup = parser.add_mutually_exclusive_group()
    serviceGroup.add_argument('-db', action="store_const", dest="service", const='db')
    serviceGroup.add_argument('-bcn', action="store_const", dest="service", const='bcn')
    serviceGroup.add_argument('-sync', action="store_const", dest="service", const='sync')
    serviceGroup.add_argument('-node', action="store_const", dest="service", const='node')

    parser.set_defaults(service='')

    parser.add_argument('-cpus', dest="cpus",type=int)

    args = parser.parse_args()

    print(args)

    commandLine = ' docker compose -f docker-compose.yml -f chain-setup/'+args.chain+'-'+args.network+'/docker-compose-local-'+args.chain+'-'+args.network+'.yml '

    print(commandLine)
    # ltc and regtest are the default
    if(args.cloud == 'local'):
        if(args.network == 'regtest'):
            subprocess.run(
                ['sh', '-c', commandLine+' up {0}'.format(args.service)]) 
        else:
            # testnet or mainnet
            if(args.service == ''):
                # All services: only run bcn, it will launch the dependencies node and db
                subprocess.run(
                    ['sh', '-c', commandLine+' run -d bcn']) 
                # Launch sync in automatic parallel mode
                runSync(args, commandLine)
            else:
                # One service at time
                if(args.service == 'db' or args.service == 'node' or args.service == 'bcn'):
                    subprocess.run(
                        ['sh', '-c', commandLine+' run -d {0}'.format(args.service)]) 
                    
                if(args.service == 'sync'):   
                    runSync(args, commandLine)


    else:
        projectName = subprocess.check_output("grep PROJECT_NAME .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
        print('AWS projectName {0} '.format(projectName))
        packageJsonFd = open('package.json')
        jsonData = json.load(packageJsonFd)
        currentVersion = jsonData['version']
        print('version {0}'.format(currentVersion))
        packageJsonFd.close()

        loadBalancer=subprocess.check_output("grep x-aws-loadbalancer chain-setup/aws/docker-compose-aws-ltc-testnet.yml | sed 's/.*x-aws-loadbalancer: \(.*\).*/\1/'", shell=True).decode("utf-8").strip()

        command = 'convert' if args.cloud == 'convert' else 'up'
        print('sh -c {0} && docker --debug compose --project-name {1} -f docker-compose.yml -f chain-setup/aws/docker-compose-aws-ltc-testnet.yml {2}'.format(EXPORT_CREDENTIALS, projectName, command))
        
        cont = input('Deploying/converting to AWS. --project-name {0} load balancer: {1} version: {2}. Continue? (Y/N): '.format(projectName, loadBalancer, currentVersion))
        if cont=='yes' or cont=='y' or cont=='YES' or cont=='Y':
            subprocess.run(
                ['sh', '-c', "{0} && docker --debug compose --project-name {1} -f docker-compose.yml -f chain-setup/aws/docker-compose-aws-ltc-testnet.yml {2}".format(EXPORT_CREDENTIALS, projectName, command)])

if __name__ == '__main__':
    main()
    