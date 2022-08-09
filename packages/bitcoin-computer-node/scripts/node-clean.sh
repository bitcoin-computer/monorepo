#!/bin/sh
NodeDir="../../../repo-testing/packages/bitcoin-computer-node"
if [ "${PWD##*/}" = "bitcoin-computer-node-secret" ]
then
  sudo chown $USER $NodeDir/chain-setup/**/db-data/ -v
  sudo chgrp $USER $NodeDir/chain-setup/**/db-data/ -v
  sudo chown $USER $NodeDir/chain-setup/**/blockchain-data/ -v
  sudo chgrp $USER $NodeDir/chain-setup/**/blockchain-data/ -v

  rm -rf $NodeDir/src
  rm -rf $NodeDir/test
  sudo rm -rf $NodeDir/chain-setup
  rm -rf $NodeDir/.env.*
  rm -rf $NodeDir/.gitignore
  rm -rf $NodeDir/docker-compose.yml
  # rm -rf $NodeDir/package.json
  rm -rf $NodeDir/db
  rm -rf $NodeDir/scripts
  rm -rf $NodeDir/README.md
else
  echo "Present directory is not bitcoin-computer-node-secret"
  exit 1
fi
