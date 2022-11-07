#!/bin/sh

sudo apt-get update

# install npm and yarn
sudo apt install nodejs npm
sudo npm install --global yarn

# install bitcoin-computer-dependencies
yarn install --ignore-engines

# install docker
sudo apt-get install ca-certificates curl  gnupg 
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker ${USER}

# log out and log back in to apply changes
