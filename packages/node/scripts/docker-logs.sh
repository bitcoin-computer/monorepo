#!/bin/bash

# Get all containers from bitcoin-computer-node service
container_ids=$(docker ps -qf "ancestor=bitcoin-computer-node")
system_timezone=$(timedatectl show --property=Timezone --value)
export TZ="$system_timezone"

datestr=$(date +%Y-%m-%d)
filepath="logs/debug-${datestr}.log"

# Iterate over each container ID and connect to it
for container_id in $container_ids; do
    echo "Connecting to container $container_id..."
    docker exec $container_id tail -n 10 $filepath
done
echo ''

# Define .env path
env_path='../.env'

# Read chain and network from env_path
chain=$(grep 'BCN_CHAIN=' $env_path | cut -d '=' -f2)
network=$(grep 'BCN_NETWORK=' $env_path | cut -d '=' -f2)

if [ "$network" = "mainnet" ]; then
    debug="/debug.log"
else
    if [ "$network" = "testnet" ]; then
        debug="/testnet3/debug.log"
    else
        debug="/regtest/debug.log"
    fi
fi

# Get bitcoin data directory from .env
logpath=$(grep 'BITCOIN_DATA_DIR=' $env_path | cut -d '=' -f2)

# Remove single quotes from the logpath
logpath=$(echo $logpath | tr -d "'")

echo '------ node ------'

# Get the logs from the bitcoin node (default LTC testnet)
node_container_image=$(docker compose -f ../docker-compose.yml ps -q node | xargs docker inspect --format='{{.Image}}' | sed -e 's/^sha256:/\'$'\n/g')
node_container_id=$(docker ps -qf "ancestor=$node_container_image")
docker exec $node_container_id tail -n 5 $logpath$debug

echo '------ postgress ------'

# Get the logs from the postgres container
postgres_container_id=$(docker ps -qf "ancestor=postgres")
docker logs --tail 5 $postgres_container_id

echo ''

echo '------ Checking errors ------'
# Get all containers created by the sync service
container_ids=$(docker ps -qf "ancestor=bitcoin-computer-node")
for container_id in $container_ids; do
    echo "Connecting to container $container_id..."
    docker exec $container_id sh -c "cat logs/*.log | grep error"
done
echo ''