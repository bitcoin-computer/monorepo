#!/bin/sh

# This script can be used to count the number of errors of different kinds.
# This is conveniant when fixing non-deterministic bugs
#
# Usage example:
# yarn run test-async test/db.async-test.ts &> errors.txt; ./scripts/count-errors.sh;

grep -c '✓' ./errors.txt | tr -d '\n';
echo ' passed';

grep -c '✕' ./errors.txt | tr -d '\n';
echo ' failed\n';

grep -c 'Missing inputs' ./errors.txt | tr -d '\n';
echo ' Missing inputs';

grep -c 'too-long-mempool-chain' ./errors.txt | tr -d '\n';
echo ' too-long-mempool-chain';

grep -c 'txn-mempool-conflict' ./errors.txt | tr -d '\n';
echo ' txn-mempool-conflict';

grep -c 'Please use a fresh authentication token' ./errors.txt | tr -d '\n';
echo ' Please use a fresh authentication token';

grep -c 'Not found' ./errors.txt | tr -d '\n';
echo ' Not found';

grep -c 'mandatory-script-verify-flag-failed (Push value size limit exceeded)' ./errors.txt | tr -d '\n';
echo ' mandatory-script-verify-flag-failed (Push value size limit exceeded)';

grep -c 'Timeout' ./errors.txt | tr -d '\n';
echo ' Timeout';
