#!/bin/sh
LibDir="../../../monorepo/packages/lib"

cp -r dist/src/. $LibDir/src
cp -r dist/test/. $LibDir/test
cp ./.env.* $LibDir
cp ./.gitignore $LibDir
cp ./yarn.lock $LibDir
cp ./README.md $LibDir
cp -r ./config $LibDir
cp -r scripts/. $LibDir/scripts/
mv $LibDir/config/config.ts $LibDir/config/config.js
rm $LibDir/config/config.test.ts
mv $LibDir/config/constants.ts $LibDir/config/constants.js
