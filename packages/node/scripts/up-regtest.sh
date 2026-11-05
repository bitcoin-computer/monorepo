#!/bin/sh
# Start or stop one regtest stack per chain from this package.
# Default chains are LTC and BTC. Override with arguments or BCN_REGTEST_CHAINS.
#   npm run up:regtest
#   npm run up:regtest -- DOGE PEPE
#   BCN_REGTEST_CHAINS='LTC DOGE' npm run up:regtest
#   npm run down:regtest -- LTC BTC
# Set BCN_REGTEST_DRY_RUN=1 to print the compose commands without running them.
set -eu

cd "$(dirname "$0")/.."

action=up
if [ "${1:-}" = up ] || [ "${1:-}" = down ]; then
  action=$1
  shift
fi

if [ "$#" -gt 0 ]; then
  chain_list=$*
elif [ -n "${BCN_REGTEST_CHAINS:-}" ]; then
  chain_list=$BCN_REGTEST_CHAINS
else
  chain_list='LTC BTC'
fi
chain_list=$(printf '%s' "$chain_list" | tr ',' ' ')

# Shell values must not override the per-chain env file.
unset BCN_CHAIN BCN_NETWORK BCN_ENV BCN_PORT BCN_URL BCN_HOST_PORT BCN_ENV_FILE BCN_LOG_DIR \
  BCN_ZMQ_URL BCN_ZMQ_PORT BCN_ZMQ_HOST_PORT \
  POSTGRES_PORT POSTGRES_HOST_PORT POSTGRES_HOST POSTGRES_USER \
  BITCOIN_RPC_PORT BITCOIN_RPC_HOST_PORT BITCOIN_RPC_HOST \
  BITCOIN_IMAGE BITCOIN_DATA_DIR BITCOIN_CONF_FILE BITCOIN_P2P_PORT \
  BCN_PRIVATE_BIND || true

in_list() {
  case " $1 " in
    *" $2 "*) return 0 ;;
    *) return 1 ;;
  esac
}

next_free() {
  port=$1
  used=$2
  while in_list "$used" "$port"; do
    port=$((port + 1))
  done
  printf '%s' "$port"
}

env_value() {
  file=$1
  key=$2
  line=$(grep -E "^${key}=" "$file" | head -n 1 || true)
  if [ -z "$line" ]; then
    printf ''
    return
  fi
  val=${line#*=}
  val=$(printf '%s' "$val" | sed -e 's/[[:space:]]*#.*$//')
  val=$(printf '%s' "$val" | sed -e "s/^['\"]//" -e "s/['\"]$//")
  printf '%s' "$val"
}

set_key() {
  file=$1
  key=$2
  value=$3
  tmp=$(mktemp)
  awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    $0 ~ "^" key "=" { print key "=" value; found = 1; next }
    { print }
    END { if (!found) print key "=" value }
  ' "$file" > "$tmp"
  mv "$tmp" "$file"
}

# node-secret tests dial the chain named in .env on its example host ports
# (Postgres 5432, BCN 1031, ZMQ 28332). Start that chain first so only the
# others move to the next free host port. npm run up publishes the same ports.
home_chain=$(env_value .env BCN_CHAIN)
home_chain=$(printf '%s' "${home_chain:-LTC}" | tr '[:lower:]' '[:upper:]')
home_first=''
others=''
placed_home=0
for raw in $chain_list; do
  chain=$(printf '%s' "$raw" | tr '[:lower:]' '[:upper:]')
  if [ "$placed_home" -eq 0 ] && [ "$chain" = "$home_chain" ]; then
    home_first=$chain
    placed_home=1
  else
    others="$others $chain"
  fi
done
chain_list="$home_first$others"

seen_chains=''
used_bcn=''
used_pg=''
used_zmq=''
used_rpc=''

for raw in $chain_list; do
  chain=$(printf '%s' "$raw" | tr '[:lower:]' '[:upper:]')
  case "$chain" in
    *[!A-Z0-9]*)
      echo "Invalid chain name: $raw" >&2
      exit 1
      ;;
  esac
  if in_list "$seen_chains" "$chain"; then
    echo "Chain $chain was given twice." >&2
    exit 1
  fi
  seen_chains="$seen_chains $chain"

  example="chain-setup/$chain/regtest/.env.example"
  if [ ! -f "$example" ]; then
    echo "No regtest env for $chain ($example)." >&2
    exit 1
  fi

  lower=$(printf '%s' "$chain" | tr '[:upper:]' '[:lower:]')
  project="bcn-$lower"
  out="/tmp/bcn-regtest-$lower.env"
  cp "$example" "$out"

  bcn_port=$(env_value "$out" BCN_PORT)
  pg_port=$(env_value "$out" POSTGRES_PORT)
  zmq_port=$(env_value "$out" BCN_ZMQ_PORT)
  rpc_port=$(env_value "$out" BITCOIN_RPC_PORT)
  if [ -z "$bcn_port" ] || [ -z "$pg_port" ] || [ -z "$zmq_port" ] || [ -z "$rpc_port" ]; then
    echo "$example is missing BCN_PORT, POSTGRES_PORT, BCN_ZMQ_PORT, or BITCOIN_RPC_PORT." >&2
    exit 1
  fi

  bcn_host=$(next_free "$bcn_port" "$used_bcn")
  pg_host=$(next_free "$pg_port" "$used_pg")
  zmq_host=$(next_free "$zmq_port" "$used_zmq")
  rpc_host=$(next_free "$rpc_port" "$used_rpc")
  used_bcn="$used_bcn $bcn_host"
  used_pg="$used_pg $pg_host"
  used_zmq="$used_zmq $zmq_host"
  used_rpc="$used_rpc $rpc_host"

  set_key "$out" BCN_ENV_FILE "$out"
  set_key "$out" BCN_LOG_DIR "./logs/$chain"
  set_key "$out" BCN_HOST_PORT "$bcn_host"
  set_key "$out" POSTGRES_HOST_PORT "$pg_host"
  set_key "$out" BCN_ZMQ_HOST_PORT "$zmq_host"
  set_key "$out" BITCOIN_RPC_HOST_PORT "$rpc_host"
  set_key "$out" BCN_URL "http://127.0.0.1:$bcn_host"

  echo "$chain  project $project  http://127.0.0.1:$bcn_host  (container $bcn_port, rpc host $rpc_host, postgres host $pg_host, zmq host $zmq_host)"

  if [ "${BCN_REGTEST_DRY_RUN:-}" = 1 ]; then
    if [ "$action" = up ]; then
      echo "docker compose -p $project -f docker-compose.yml --env-file $out up -d"
    else
      echo "docker compose -p $project -f docker-compose.yml --env-file $out down"
    fi
    continue
  fi

  if [ "$action" = up ]; then
    docker compose -p "$project" -f docker-compose.yml --env-file "$out" up -d
  else
    docker compose -p "$project" -f docker-compose.yml --env-file "$out" down
  fi
done
