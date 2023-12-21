#!/bin/sh

# Replace RPC_USER and RPC_PASSWORD in test/index.ts using the values from .env
RPC_USER_VALUE=$(grep "^RPC_USER=" .env | awk -F"=" '{print $2}')
RPC_PASSWORD_VALUE=$(grep "^RPC_PASSWORD=" .env | awk -F"=" '{ for(i=2; i<=NF; i++) printf $i (i==NF ? "" : "=") }')
sed -i.bak "s/'rpc_user'/'$RPC_USER_VALUE'/; s/'rpc_password'/'$RPC_PASSWORD_VALUE'/" test/index.ts

# Run yarn tsc-compile
yarn tsc-compile

# Undo the changes and remove the backup file
cp test/index.ts.bak test/index.ts
rm test/index.ts.bak

# Any export (currently Contract, Computer, Memory) have to be imported from src/index directly, both in the test and src,
# otherwise we get errors as the above classes will have a different scope than the test files.
# The below loop deletes the lines containing imports of Contract, Computer, Memory from transpiled test files, so that we 
# import them from "dist/bc-lib.browser.min.mjs". 

# Iterate over all files in js-build/test ending with test.js and delete the first line that ends with '../src' (these are exactly
# the lines containing imports of Contract, Computer, Memory.
for file in js-build/test/*test.js; do
    
    # Find the first occurrence line number that contains '../src'
    line_num=$(grep -n "'..\/src';$" "$file" | head -n1 | cut -d: -f1)
    
    # If the line number is found, delete that line
    if [ ! -z "$line_num" ]; then
        sed -i '' "${line_num}d" "$file"
    fi
done
