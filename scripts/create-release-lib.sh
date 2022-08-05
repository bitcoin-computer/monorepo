#!/bin/bash

cd ./packages/bitcoin-computer-lib
rm -rf .git
git init
git remote add origin https://github.com/bitcoin-computer/bitcoin-computer-lib.git
echo "creating branch release-$(grep -m 1 version package.json | cut -d ':' -f2 | cut -d '"' -f 2)"
git checkout -b release-$(grep -m 1 version package.json | cut -d ':' -f2 | cut -d '"' -f 2)
git add .
git commit -m "release changes"
git push origin release-$(grep -m 1 version package.json | cut -d ':' -f2 | cut -d '"' -f 2)
rm -rf .git