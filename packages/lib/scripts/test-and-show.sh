#!/bin/bash

args="$@"
# read filename as second argument
async="$1"
filename="$2"
aws="$3"

echo "Arguments: $args"
echo "Async: $async"
echo "Filename: $filename"
echo "AWS: $aws"

npm run test -- $async $aws 2>&1 | tee $filename
open $filename &
