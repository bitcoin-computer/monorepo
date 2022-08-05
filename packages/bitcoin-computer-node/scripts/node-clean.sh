#!/bin/sh

if [ "${PWD##*/}" = "bitcoin-computer-node-secret" ]
then
  sudo chown $USER ../bitcoin-computer-node/chain-setup/**/db-data/ -v
  sudo chgrp $USER ../bitcoin-computer-node/chain-setup/**/db-data/ -v
  sudo chown $USER ../bitcoin-computer-node/chain-setup/**/blockchain-data/ -v
  sudo chgrp $USER ../bitcoin-computer-node/chain-setup/**/blockchain-data/ -v

  rm -rf ../bitcoin-computer-node/src
  rm -rf ../bitcoin-computer-node/test
  sudo rm -rf ../bitcoin-computer-node/chain-setup
  rm -rf ../bitcoin-computer-node/.env.*
  rm -rf ../bitcoin-computer-node/.gitignore
  rm -rf ../bitcoin-computer-node/docker-compose.yml
  rm -rf ../bitcoin-computer-node/package.json
  rm -rf ../bitcoin-computer-node/db
  rm -rf ../bitcoin-computer-node/scripts
  rm -rf ../bitcoin-computer-node/README.md
else
  echo "Present directory is not bitcoin-computer-node-secret"
  exit 1
fi
