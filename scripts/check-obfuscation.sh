#!/bin/bash

# List of folders to skip
skip_folders=("vite-template" "nft" "explorer" "wallet" "chat" "website")

# Check if the obfuscation was successful on all dist folders
msg="Checking obfuscation ..."
for folder in $(find ./packages -type d -name dist -maxdepth 2); do
  # Extract the parent folder name
  parent_folder=$(basename "$(dirname "$folder")")
  # Check if the parent folder is in the skip list
  if [[ " ${skip_folders[@]} " =~ " ${parent_folder} " ]]; then
    echo "Skipping obfuscation check for $parent_folder"
    continue
  fi

  for file in $folder/*.*; do
    # search for two spaces on the first bytes of the file
    head -c 1024 "$file" | grep -q '  ' && echo "Obfuscation failed for $file" && exit 1
  done
done

echo "$msg (OK)"

exit 0
