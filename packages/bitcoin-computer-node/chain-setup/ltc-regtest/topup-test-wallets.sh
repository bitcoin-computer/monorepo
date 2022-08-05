#!/bin/bash

ENV_PATH=".env"
REGTEST_ADDRESSES=$(grep TEST_ADDRESS $ENV_PATH | cut -d '=' -f2)

arr=(${REGTEST_ADDRESSES//";"/ })

for val in "${arr[@]}";
do
  echo "Minting block for address $val"
  yarn bitcoin-cli-ltc-regtest -regtest=1 -rpcport=19332 generatetoaddress 1 $val
  echo "Minted block."
done
yarn bitcoin-cli-ltc-regtest -regtest=1 -rpcport=19332 generatetoaddress 100 "mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr"
