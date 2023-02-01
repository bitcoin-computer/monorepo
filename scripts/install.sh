#!/bin/bash

# download the code
git clone git@github.com:bitcoin-computer/monorepo.git

# install dependencies
cd monorepo
lerna bootstrap
