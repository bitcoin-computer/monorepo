#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.

import argparse
import subprocess

parser = argparse.ArgumentParser()
chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", action="store_const", dest="chain", const='btc')
chainGroup.add_argument("-ltc", "--litecoin", action="store_const", dest="chain", const='ltc')
chainGroup.add_argument("-pepe", "--pepecoin", action="store_const", dest="chain", const='pepe')
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

args = parser.parse_args()

print(args)

commandLine = ' docker compose -f docker-compose.yml -f chain-setup/'+args.chain+'-'+args.network+'/docker-compose.yml '

print(commandLine+' down')
subprocess.run(
    ['sh', '-c', commandLine+' down --remove-orphans'])
