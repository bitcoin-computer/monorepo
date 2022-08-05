#!/bin/sh

if [ "${PWD##*/}" = "bitcoin-computer-lib-secret" ]
then
  rm ../bitcoin-computer-lib/bitcoin-computer-lib.*.js
  rm ../bitcoin-computer-lib/bitcoin-computer-lib.*.mjs
  rm -rf dist/test ../bitcoin-computer-lib/test/
  rm ../bitcoin-computer-lib/.env.*
  rm ../bitcoin-computer-lib/.gitignore 
  rm ../bitcoin-computer-lib/yarn.lock
  rm ../bitcoin-computer-lib/jest.config.json
  rm ../bitcoin-computer-lib/jest.async.config.json
  rm ../bitcoin-computer-lib/README.md
  rm ../bitcoin-computer-lib//package.json
  rm -rf ../bitcoin-computer-lib/config
  rm -rf ../bitcoin-computer-lib/.husky
  rm -rf ../bitcoin-computer-lib/.github
  rm -rf ../bitcoin-computer-lib/scripts
else
  echo "Present directory is not bitcoin-computer-lib-secret"
  exit 1
fi
