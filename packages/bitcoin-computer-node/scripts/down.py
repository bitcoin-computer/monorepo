#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.

import argparse
import subprocess

parser = argparse.ArgumentParser()
chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", action="store_true")
chainGroup.add_argument("-ltc", "--litecoin",
                        action="store_true", default=True)

networkGroup = parser.add_mutually_exclusive_group()
networkGroup.add_argument("-t", "--testnet", action="store_true")
networkGroup.add_argument("-r", "--regtest", action="store_true", default=True)

args = parser.parse_args()

print(args)

# ltc and regtest are the default
if(args.bitcoin):
    if(args.testnet):
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/btc-testnet/docker-compose-local-btc-testnet.yml down'])
    else:
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/btc-regtest/docker-compose-local-btc-regtest.yml down'])
else:
    if(args.testnet):
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/ltc-testnet/docker-compose-local-ltc-testnet.yml down'])
    else:
        subprocess.run(
            ['sh', '-c', 'docker compose -f docker-compose.yml -f chain-setup/ltc-regtest/docker-compose-local-ltc-regtest.yml down'])
