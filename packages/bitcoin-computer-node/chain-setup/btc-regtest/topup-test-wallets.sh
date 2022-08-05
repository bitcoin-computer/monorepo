#!/bin/bash

ENV_PATH=".env"
REGTEST_ADDRESSES=$(grep TEST_ADDRESS $ENV_PATH | cut -d '=' -f2)
WALLET_NAME=$(grep DEFAULT_WALLET $ENV_PATH | cut -d '=' -f2)

arr=(${REGTEST_ADDRESSES//";"/ })

yarn bitcoin-cli-btc-regtest -regtest=1 -rpcport=8332 createwallet $WALLET_NAME
yarn bitcoin-cli-btc-regtest -regtest=1 -rpcport=8332 loadwallet $WALLET_NAME

for val in "${arr[@]}";
do
  echo "Minting block for address $val"
  yarn bitcoin-cli-btc-regtest -regtest=1 -rpcport=8332 generatetoaddress 1 $val
  echo "Minted block."
done
yarn bitcoin-cli-btc-regtest -regtest=1 -rpcport=8332 generatetoaddress 100 "mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr"
