#!/bin/bash

# Check if the obfuscation was successful on all dist folders
msg="Checking obfuscation ..."
for folder in $(find . -type d -name dist -not -path "./node_modules/*" -maxdepth 3); do
  for file in $folder/*.*; do
    # search for two spaces on the first bytes of the file
    head -c 1024 "$file" | grep -q '  ' && echo "Obfuscation failed for $file" && exit 1
  done
done

echo "$msg (OK)"

exit 0
