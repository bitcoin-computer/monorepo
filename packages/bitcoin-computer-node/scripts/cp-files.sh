#!/bin/sh
NodeDir="../../../repo-testing/packages/bitcoin-computer-node"
cp -r dist/min/. $NodeDir/src/
cp -r dist/test/. $NodeDir/test/
rsync -a --exclude='*/db-data' --exclude='*/blockchain-data' chain-setup/ $NodeDir/chain-setup/
cp ./jest.config.json $NodeDir/.
cp ./.dockerignore $NodeDir/.
cp ./README.md $NodeDir/.
cp ./.env.* $NodeDir/.
cp ./.gitignore $NodeDir/.
cp ./docker-compose.yml $NodeDir/.
cp ./package.json $NodeDir/.
cp -r db/. $NodeDir/db/
cp -r scripts/. $NodeDir/scripts/
cp -r ./README.md $NodeDir/.
