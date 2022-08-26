#!/bin/sh
docker-compose run bitcoin-cli -regtest -rpcport=8332 -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= generatetoaddress 1 "miKQVhZbFKSsJcQZ8eXwBQ89xNyetpN34q"
docker-compose run bitcoin-cli -regtest -rpcport=8332 -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= generatetoaddress 1 "mzoGRNh55y9j57TPdwRGi3nt9X4CFwpqUS"
docker-compose run bitcoin-cli -regtest -rpcport=8332 -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= generatetoaddress 1 "n1X6JFDyxibtdhYrc7mrkuft6o168ELFNW"
docker-compose run bitcoin-cli -regtest -rpcport=8332 -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= generatetoaddress 1 "mjLcig6eTZVJkgRgJFMkwrYHpfMnZ1t4kk"
docker-compose run bitcoin-cli -regtest -rpcport=8332 -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= generatetoaddress 1 "mfYkMQAe7afeRSkgLxAtwnMVryjLTfr95Q"

docker-compose run bitcoin-cli -regtest -rpcport=8332 -rpcuser=bcn-admin -rpcpassword=kH4nU5Okm6-uyC0_mA5ztVNacJqZbYd_KGLl6mx722A= generatetoaddress 100 "mrpdUjdfFZQWRYaqgqjgoXTJqn5rwahTHr"
