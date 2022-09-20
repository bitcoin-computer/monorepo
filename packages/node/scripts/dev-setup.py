#!/usr/bin/env python3
# Copyright (c) 2021-2022 Bitcoin Computer developers
# Distributed under the MIT software license.

import argparse
import subprocess

parser = argparse.ArgumentParser()
chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", action="store_const", dest="chain", const='BTC')
chainGroup.add_argument("-ltc", "--litecoin", action="store_const", dest="chain", const='LTC')
parser.set_defaults(chain='LTC')

networkGroup = parser.add_mutually_exclusive_group()
networkGroup.add_argument("-t", "--testnet", action="store_const", dest="network", const='testnet')
networkGroup.add_argument("-m", "--mainnet", action="store_const", dest="network", const='mainnet')
networkGroup.add_argument("-r", "--regtest", action="store_const", dest="network", const='regtest')
parser.set_defaults(network='regtest')

args = parser.parse_args()

print(args)

port = '8332' if args.chain == 'BTC' else '19332'
command = "BCN_URL=http://127.0.0.1:3000 BCN_ENV=dev CHAIN={0} NETWORK={1} POSTGRES_HOST=127.0.0.1 RPC_HOST=127.0.0.1 RPC_PORT={2}  RPC_PROTOCOL=http RPC_USER=bcn-admin RPC_PASSWORD=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= ZMQ_URL=tcp://127.0.0.1:28332 UN_P2SH_URL=http://127.0.0.1:3000 node --loader ts-node/esm $(grep START_PATH .package.paths | cut -d '=' -f2)".format(args.chain, args.network, port)

print(command)

# ltc and regtest are the default
subprocess.run(
    ['sh', '-c', command])
