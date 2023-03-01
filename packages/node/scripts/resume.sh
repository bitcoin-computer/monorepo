#!/bin/bash

# Get list of running Docker containers
container_ids=$(docker ps -q)

# Iterate over each container ID and connect to it
for container_id in $container_ids; do
    echo "Connecting to container $container_id..."
    docker exec $container_id tail -n 1 logs/verbose.log
done