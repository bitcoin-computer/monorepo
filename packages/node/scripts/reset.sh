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
TRUNCATE TABLE "Input";
TRUNCATE TABLE "Output";
TRUNCATE TABLE "Block";
TRUNCATE TABLE "Orphan";
TRUNCATE TABLE "User";
TRUNCATE TABLE "OffChain";
TRUNCATE TABLE "TxStatus";
TRUNCATE TABLE "BlockStatus";
EOF

# stop all docker containers and networks
# docker ps -a --format="{{.ID}}" | xargs docker update --restart=no | xargs docker stop
docker stop $(docker ps -a -q) & docker update --restart=no $(docker ps -a -q) & systemctl restart docker

# Delete all volumes:
docker volume rm $(docker volume ls -q)

# Delete all containers:
docker rm -f $(docker ps -a -q)

# delete all dangling containers, images, volumes, networks
docker system prune
docker network prune
docker volume prune

# uncomment to delete all stopped containers and unused images
# docker system prune -a

# delete data files
rm -rf ./data/
# delete the logs
yes | rm -r logs
rm error.log

exit 0
