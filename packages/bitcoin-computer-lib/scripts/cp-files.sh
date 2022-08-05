#!/bin/sh

cp -r dist/src/. ../bitcoin-computer-lib/
cp -r dist/test ../bitcoin-computer-lib/
cp ./.env.* ../bitcoin-computer-lib/
cp ./.gitignore ../bitcoin-computer-lib/
cp ./yarn.lock ../bitcoin-computer-lib/
cp ./jest.config.json ../bitcoin-computer-lib/
cp ./jest.async.config.json ../bitcoin-computer-lib/
cp ./README.md ../bitcoin-computer-lib/
cp ./package.json ../bitcoin-computer-lib/
cp -r ./config ../bitcoin-computer-lib/
mv ../bitcoin-computer-lib/config/config.ts ../bitcoin-computer-lib/config/config.js
mv ../bitcoin-computer-lib/config/config.test.ts ../bitcoin-computer-lib/config/config.test.js
mv ../bitcoin-computer-lib/config/constants.ts ../bitcoin-computer-lib/config/constants.js
cp -r ./scripts ../bitcoin-computer-lib/
