#!/bin/bash

CONTAINER_NODE_ID=$(docker ps -qf "ancestor=litecoinproject/litecoin-core:0.21")
CONTAINER_DB_ID=$(docker ps -qf "ancestor=postgres")

coordinator_db_logs=$(docker exec $CONTAINER_DB_ID psql -U bcn -d bcn -c 'select bs."blockToSync" as "coordinator.height" from "BlockStatus" bs LIMIT 1')
workers_db_logs=$(docker exec $CONTAINER_DB_ID psql -U bcn -d bcn -c 'select max(ts."blockToSync") as "workers.maxheight" from "TxStatus" ts')

node_logs=$(docker exec $CONTAINER_NODE_ID /bin/bash -c 'cat /home/litecoin/.litecoin/testnet4/debug.log | tail -1000 |grep "UpdateTip" | tail -n 1')

# append to /tmp/metric.log the results
# Echo timestamp - hour
echo "" >> /tmp/metric.log
echo $(date) >> /tmp/metric.log
echo $coordinator_db_logs >> /tmp/metric.log
echo $workers_db_logs >> /tmp/metric.log
echo $node_logs >> /tmp/metric.log
