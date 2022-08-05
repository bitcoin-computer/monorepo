#!/bin/sh

cp -r dist/min/. ../bitcoin-computer-node/src/
cp -r dist/test/. ../bitcoin-computer-node/test/
rsync -a --exclude='*/db-data' --exclude='*/blockchain-data' chain-setup/ ../bitcoin-computer-node/chain-setup/
cp ./jest.config.json ../bitcoin-computer-node/
cp ./.dockerignore ../bitcoin-computer-node/
cp ./README.md ../bitcoin-computer-node/
cp ./.env.* ../bitcoin-computer-node/
cp ./.gitignore ../bitcoin-computer-node/
cp ./docker-compose.yml ../bitcoin-computer-node/
cp ./package.json ../bitcoin-computer-node/
cp -r db/. ../bitcoin-computer-node/db/
cp -r scripts/. ../bitcoin-computer-node/scripts/
cp -r ./README.md ../bitcoin-computer-node/
