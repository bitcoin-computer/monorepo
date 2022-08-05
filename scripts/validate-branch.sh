#!/bin/bash

# Throw an error if current branch isn't master
validate_branch() {
    var="$(git branch --show-current 2>&1)"

    if [ "$var" = "master" ]
    then
        echo "git push to master branch is not allowed. Please create PR"
        exit 1
    fi
}
