#!/bin/bash
set -e

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
packages_dir="$script_dir/../packages"

# === Configuration ===
FOLDER='dist/'          
failed=0

echo "Checking obfuscation in dist folders..."

for folder in "$packages_dir/lib/dist" "$packages_dir/node/dist"; do
  parent_folder=$(basename "$(dirname "$folder")")
  echo "Checking $parent_folder"

  for file in "$folder"/*.*; do
    if [ ! -f "$file" ]; then
      continue
    fi

    if head -c 1024 "$file" | grep -q '  '; then
      echo "Obfuscation failed for $file"
      failed=1
    fi
  done
done

echo "Checking staged dist/ files..."

staged_files_tmp=$(mktemp)

# Save staged files into a temp file
git diff --cached --name-only --diff-filter=ACM | grep -E "$FOLDER" > "$staged_files_tmp" || true
while IFS= read -r file; do
  if [ ! -f "$file" ]; then
    continue
  fi

  echo "Checking staged file: $file"

  if git show ":$file" | head -c 1024 | grep -q '  '; then
    echo "Obfuscation failed for staged file: $file"
    echo "↩️  Unstaging $file..."
    git restore --staged "$file" || true
    echo "Restored. Please fix the obfuscation and stage the file again."
    failed=1
  fi
done < "$staged_files_tmp"

rm -f "$staged_files_tmp"
if [ "$failed" -eq 1 ]; then
  echo "Obfuscation check FAILED"
  exit 1
else
  echo "Obfuscation check OK"
  exit 0
fi
