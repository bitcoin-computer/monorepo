#!/usr/bin/env python3

import argparse
import json
import subprocess

parser = argparse.ArgumentParser()
chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", action="store_const", dest="chain", const='bitcoin')
chainGroup.add_argument("-ltc", "--litecoin", action="store_const", dest="chain", const='litecoin')
parser.set_defaults(chain='litecoin')

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

args = parser.parse_args()

print(args)

# ltc and regtest are the default
if(args.chain == 'bitcoin'):
    if(args.network == 'testnet'):
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/btc-testnet/docker-compose-local-btc-testnet.yml up'])
    else:
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/btc-regtest/docker-compose-local-btc-regtest.yml up'])
else:
    if(args.network == 'testnet'):
        if(args.cloud == 'aws' or args.cloud == 'convert'):
            projectName = subprocess.check_output("grep PROJECT_NAME .env.aws | cut -d '=' -f2", shell=True).decode("utf-8").strip()
            print('AWS projectName {0} '.format(projectName))
            packageJsonFd = open('package.json')
            jsonData = json.load(packageJsonFd)
            currentVersion = jsonData['version']
            print('version {0}'.format(currentVersion))
            packageJsonFd.close()

            loadBalancer=subprocess.check_output("grep x-aws-loadbalancer chain-setup/aws/docker-compose-aws-ltc-testnet.yml | sed 's/.*x-aws-loadbalancer: \(.*\).*/\1/'", shell=True).decode("utf-8").strip()

            command = 'convert' if args.cloud == 'convert' else 'up'
            print('sh -c ./scripts/aws-setup.py awsSecretExport && docker --debug compose --project-name {0} -f docker-compose.yml -f chain-setup/aws/docker-compose-aws-ltc-testnet.yml {1}'.format(projectName, command))
            
            cont = input('Deploying/converting to AWS. --project-name {0} load balancer: {1} version: {2}. Continue? (Y/N): '.format(projectName, loadBalancer, currentVersion))
            if cont=='yes' or cont=='y' or cont=='YES' or cont=='Y':
                subprocess.run(
                    ['sh', '-c', './scripts/aws-setup.py awsSecretExport && docker --debug compose --project-name {0} -f docker-compose.yml -f chain-setup/aws/docker-compose-aws-ltc-testnet.yml {1}'.format(projectName, command)])
        elif (args.cloud == 'local'):
            subprocess.run(
                ['sh', '-c', './scripts/aws-setup.py awsSecretExport && docker compose -f docker-compose.yml -f chain-setup/ltc-testnet/docker-compose-local-ltc-testnet.yml up'])
    elif(args.network == 'regtest'):
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/ltc-regtest/docker-compose-local-ltc-regtest.yml up'])

           
