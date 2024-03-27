#!/bin/bash

filename="$1"

npm run test 2>&1 | tee $filename
open $filename &
