#!/bin/bash

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# Define the base directory for the packages
packages_dir="$script_dir/../packages"

# Check if the obfuscation was successful on all dist folders
msg="Checking obfuscation ..."
for folder in "$packages_dir/lib/dist" "$packages_dir/node/dist"; do
  # Extract the parent folder name
  parent_folder=$(basename "$(dirname "$folder")")

  echo "Checking $parent_folder"
  for file in $folder/*.*; do
    # search for two spaces on the first bytes of the file
    head -c 1024 "$file" | grep -q '  ' && echo "Obfuscation failed for $file" && exit 1
  done
done

echo "$msg (OK)"

exit 0
