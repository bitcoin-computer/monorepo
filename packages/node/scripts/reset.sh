#!/bin/sh

# empty all database tables

ENV_USERNAME=$(grep POSTGRES_USER .env | cut -d '=' -f2)
ENV_PASSWORD=$(grep POSTGRES_PASSWORD .env | cut -d '=' -f2)
ENV_DATABASE=$(grep POSTGRES_DB .env | cut -d '=' -f2)

USERNAME=${ENV_USERNAME:-$ENV_USERNAME:-bcn}
PASSWORD=${ENV_PASSWORD:-$ENV_PASSWORD:-bcn}
DATABASE=${ENV_DATABASE:-$ENV_DATABASE:-bcn}
HOSTNAME=localhost

psql "postgresql://$USERNAME:$PASSWORD@$HOSTNAME/$DATABASE" << EOF
TRUNCATE TABLE "NonStandard";
TRUNCATE TABLE "Input";
TRUNCATE TABLE "Output";
TRUNCATE TABLE "User";
TRUNCATE TABLE "OffChain";
TRUNCATE TABLE "SyncStatus";

INSERT INTO "SyncStatus" ("syncedHeight", "bitcoindSyncedHeight", "bitcoindSyncedProgress") VALUES (-1, -1, 0);
EOF

# Delete all containers:
docker rm -f $(docker ps -a -q)

# Stop the container(s):
docker-compose down

# Delete all volumes:
docker volume rm $(docker volume ls -q)

# stop all docker containers and networks
docker stop $(docker ps --quiet)

# delete all dangling containers, images, volumes, networks
docker system prune
docker network prune
docker volume prune

# uncomment to delete all stopped containers and unused images
# docker system prune -a

# delete data files
rm -rf ./chain-setup/**/blockchain-data
rm -rf ./chain-setup/**/db-data

# delete the logs
yes | rm -r logs
rm error.log
