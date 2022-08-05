#!/bin/bash

git add .
git commit -m "Unset public package names"
git push origin $(git branch --show-current)
echo "Published testing packages"