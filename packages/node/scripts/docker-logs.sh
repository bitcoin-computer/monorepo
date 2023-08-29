#!/bin/bash

# Get list of running Docker containers
container_ids=$(docker ps -q)
system_timezone=$(timedatectl show --property=Timezone --value)
export TZ="$system_timezone"

datestr=$(date +%Y-%m-%d)
filepath="logs-${datestr}.log"

# Iterate over each container ID and connect to it
for container_id in $container_ids; do
    echo "Connecting to container $container_id..."
    docker exec $container_id tail -n 10 $filepath
done
echo ''

# Read argument from command line
if [ $# -eq 0 ]; then
    chain='ltc'
    network='testnet'
    logpath='/home/litecoin/.litecoin/testnet4/debug.log'
else
    chain=$1
    network=$2
    logpath=$3
fi

# Get the logs from the bitcoin node (default LTC testnet)
node_container_image=$(docker compose -f docker-compose.yml -f chain-setup/${chain}-${network}/docker-compose-local-${chain}-${network}.yml ps -q node | xargs docker inspect --format='{{.Image}}' | sed -e 's/^sha256:/\'$'\n/g')
node_container_id=$(docker ps -qf "ancestor=$node_container_image")
docker exec $node_container_id tail -n 5 $logpath