#!/bin/bash

# Throw an error if current branch isn't dev or master
validate_branch() {
    var="$(git branch --show-current 2>&1)"
    if [ "$var" != "dev" ] && [ "$var" != "master" ]
    then
        echo "Package is deploy is only allowed on the dev and master branch."
        exit 1
    fi
}
