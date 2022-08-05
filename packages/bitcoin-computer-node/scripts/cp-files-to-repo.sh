#!/bin/sh

cp -r dist/min/. ../../../monorepo-pub/packages/bitcoin-computer-node/src/
cp -r dist/test/. ../../../monorepo-pub/packages/bitcoin-computer-node/test/
rsync -a --exclude='*/db-data' --exclude='*/blockchain-data' chain-setup/ ../../../monorepo-pub/packages/bitcoin-computer-node/chain-setup/
cp ./jest.config.json ../../../monorepo-pub/packages/bitcoin-computer-node/
cp ./.dockerignore ../../../monorepo-pub/packages/bitcoin-computer-node/
cp ./README.md ../../../monorepo-pub/packages/bitcoin-computer-node/
cp ./.env.* ../../../monorepo-pub/packages/bitcoin-computer-node/
cp ./.gitignore ../../../monorepo-pub/packages/bitcoin-computer-node/
cp ./docker-compose.yml ../../../monorepo-pub/packages/bitcoin-computer-node/
cp ./package.json ../../../monorepo-pub/packages/bitcoin-computer-node/
cp -r db/. ../../../monorepo-pub/packages/bitcoin-computer-node/db/
cp -r scripts/. ../../../monorepo-pub/packages/bitcoin-computer-node/scripts/
cp -r ./README.md ../../../monorepo-pub/packages/bitcoin-computer-node/
