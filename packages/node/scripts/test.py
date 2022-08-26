#!/usr/bin/env python3

import argparse
import subprocess

rpcHostDefault = subprocess.check_output(
    "grep RPC_HOST .env | cut -d '=' -f2", shell=True).decode("utf-8").strip()
rpcUserDefault = subprocess.check_output(
    "grep RPC_USER .env | cut -d '=' -f2", shell=True).decode("utf-8").strip()
rpcPassDefault = subprocess.check_output(
    "grep RPC_PASSWORD .env | cut -d '=' -f 2-", shell=True).decode("utf-8").strip()

parser = argparse.ArgumentParser()
parser = argparse.ArgumentParser()
chainGroup = parser.add_mutually_exclusive_group()
chainGroup.add_argument("-btc", "--bitcoin", action="store_true")
chainGroup.add_argument("-ltc", "--litecoin",
                        action="store_true", default=True)

networkGroup = parser.add_mutually_exclusive_group()
networkGroup.add_argument("-r", "--regtest", action="store_true", default=True)
networkGroup.add_argument("-t", "--testnet", action="store_true")


testTypeGroup = parser.add_mutually_exclusive_group()
testTypeGroup.add_argument("-s", "--single", action="store")
testTypeGroup.add_argument("-i", "--integration", action="store_true")
testTypeGroup.add_argument("-u", "--unit", action="store_true", default=True)

args = parser.parse_args()

port = 8332 if args.bitcoin else 19332
chain = 'BTC' if args.bitcoin else 'LTC'
network = 'regtest' if args.regtest else 'testnet'
nodeUrl = 'http://127.0.0.1:3000' if args.regtest else 'https://node.bitcoincomputer.io'
postgresHost = '127.0.0.1' if args.regtest else '127.0.0.1'
rpcHost = rpcHostDefault if args.regtest else 'node.bitcoincomputer.io'
rpcUser = rpcUserDefault if args.regtest else 'bcn-admin'
rpcPass = rpcPassDefault if args.regtest else 'kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A='
zmqUrl = 'tcp://127.0.0.1:28332' if args.regtest else 'tcp://127.0.0.1:28332'
unP2shUrl = 'http://127.0.0.1:3000' if args.regtest else 'http://127.0.0.1:3000'

command = "BCN_URL={nodeUrl} CHAIN={chain} NETWORK={network} BCN_ENV=test POSTGRES_PORT=5432 POSTGRES_HOST={postgresHost} RPC_HOST={rpcHost} RPC_PORT={port} RPC_PROTOCOL=http RPC_USER={rpcUser} RPC_PASSWORD={rpcPass} ZMQ_URL={zmqUrl} UN_P2SH_URL={unP2shUrl} mocha --config".format(
    nodeUrl=nodeUrl, chain=chain, network=network, postgresHost=postgresHost, rpcHost=rpcHost, port=port, rpcUser=rpcUser, rpcPass=rpcPass, zmqUrl=zmqUrl, unP2shUrl=unP2shUrl)

# ltc, regtest and unit is default
if(args.integration):
    command = '{} .mocharc-async.json --parallel'.format(command)
elif(args.single):
    command = command + ' .mocharc-single.json ' + args.single
else:
    command = '{} .mocharc-unit.json --parallel'.format(command)

subprocess.run(
    ['sh', '-c', command])
