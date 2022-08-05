#!/bin/bash

status="$(git status)"

if [[ $status == *"nothing to commit, working tree clean"* ]]; then
  echo "Publishing test modules"
else 
  echo "You have uncommitted changes, please commit all your changes before publishing"
  exit 1
fi