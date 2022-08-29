#!/bin/sh
LibDir="../../../monorepo/packages/lib"
if [ "${PWD##*/}" = "lib-secret" ]
then
  rm $LibDir/bitcoin-computer-lib.*.js
  rm $LibDir/bitcoin-computer-lib.*.mjs
  rm -rf dist/test $LibDir/test/
  rm $LibDir/.env.*
  rm $LibDir/.gitignore 
  rm $LibDir/yarn.lock
  rm $LibDir/README.md
  # rm $LibDir//package.json
  rm -rf $LibDir/config
  rm -rf $LibDir/.husky
  rm -rf $LibDir/.github
  rm -rf $LibDir/scripts
else
  echo "Present directory is not bitcoin-computer-lib-secret"
  exit 1
fi
