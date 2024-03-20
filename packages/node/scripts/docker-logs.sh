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

# Read chain and network from the arguments
if [ $# -eq 0 ]; then
    chain='ltc'
    network='testnet'
else
    chain=$1
    network=$2
fi

# Log paths are predefined for Bitcoin and Litecoin
if [ $chain == 'btc' ]; then
    if [ $network == 'mainnet' ]; then
        logpath='/home/bitcoin/.bitcoin/debug.log'
    else
        logpath='/home/bitcoin/.bitcoin/testnet4/debug.log'
    fi
else
    if [ $network == 'mainnet' ]; then
        logpath='/home/litecoin/.litecoin/debug.log'
    else
        logpath='/home/litecoin/.litecoin/testnet4/debug.log'
    fi
fi


# Get the logs from the bitcoin node (default LTC testnet)
node_container_image=$(docker compose -f docker-compose.yml -f chain-setup/${chain}-${network}/docker-compose-local-${chain}-${network}.yml ps -q node | xargs docker inspect --format='{{.Image}}' | sed -e 's/^sha256:/\'$'\n/g')
node_container_id=$(docker ps -qf "ancestor=$node_container_image")
docker exec $node_container_id tail -n 5 $logpath

echo 'Checking errors...'
for container_id in $container_ids; do
    echo "Connecting to container $container_id..."
    docker exec $container_id sh -c "cat *.log | grep error"
done
echo ''