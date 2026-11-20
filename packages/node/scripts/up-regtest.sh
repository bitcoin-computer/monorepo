#!/bin/sh
# Start or stop one regtest stack per chain from this package.
# Default chains are LTC and BTC. Override with arguments or BCN_REGTEST_CHAINS.
#   npm run up:regtest
#   npm run up:regtest -- DOGE PEPE
#   BCN_REGTEST_CHAINS='LTC DOGE' npm run up:regtest
#   npm run down:regtest
#   npm run down:regtest -- DOGE
# A successful up records the chain and the host ports it published in
# .regtest/stacks and .regtest/hosts. A later up leaves those stacks running
# and does not give their host ports to another chain. A chain this command
# starts again publishes the ports recorded for it. The chain named in .env
# keeps the example ports when those ports are free.
# down with no chain names stops that recorded set, including an earlier up.
# Pass names to stop only those chains. With no record, down uses
# BCN_REGTEST_CHAINS, else LTC BTC.
# Set BCN_REGTEST_DRY_RUN=1 to print the compose commands without running them.
# A dry run does not record or forget.
set -eu

cd "$(dirname "$0")/.."

action=up
if [ "${1:-}" = up ] || [ "${1:-}" = down ]; then
  action=$1
  shift
fi

stacks_file=.regtest/stacks
hosts_file=.regtest/hosts

record_stack() {
  stack_chain=$1
  mkdir -p .regtest
  if [ -f "$stacks_file" ] && grep -qxF "$stack_chain" "$stacks_file"; then
    return 0
  fi
  printf '%s\n' "$stack_chain" >> "$stacks_file"
}

forget_stack() {
  stack_chain=$1
  [ -f "$stacks_file" ] || return 0
  tmp=$(mktemp)
  grep -vxF "$stack_chain" "$stacks_file" > "$tmp" || true
  if [ -s "$tmp" ]; then
    mv "$tmp" "$stacks_file"
  else
    rm -f "$tmp" "$stacks_file"
  fi
}

# One line per chain: CHAIN bcn pg zmq rpc. Replaced when that chain is started again.
record_hosts() {
  host_chain=$1
  host_bcn=$2
  host_pg=$3
  host_zmq=$4
  host_rpc=$5
  mkdir -p .regtest
  tmp=$(mktemp)
  if [ -f "$hosts_file" ]; then
    grep -v "^${host_chain} " "$hosts_file" > "$tmp" || true
  fi
  printf '%s %s %s %s %s\n' "$host_chain" "$host_bcn" "$host_pg" "$host_zmq" "$host_rpc" >> "$tmp"
  mv "$tmp" "$hosts_file"
}

forget_hosts() {
  host_chain=$1
  [ -f "$hosts_file" ] || return 0
  tmp=$(mktemp)
  grep -v "^${host_chain} " "$hosts_file" > "$tmp" || true
  if [ -s "$tmp" ]; then
    mv "$tmp" "$hosts_file"
  else
    rm -f "$tmp" "$hosts_file"
  fi
}

if [ "$action" = down ] && [ "$#" -eq 0 ] && [ -s "$stacks_file" ]; then
  chain_list=$(grep -v '^[[:space:]]*$' "$stacks_file" | tr '\n' ' ' | sed 's/[[:space:]]*$//')
  echo "Stopping stacks recorded by up:regtest: $chain_list"
elif [ "$#" -gt 0 ]; then
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
  BITCOIN_IMAGE BITCOIN_DATA_DIR BITCOIN_CONF_FILE BITCOIN_CONF_HOST_FILE BITCOIN_P2P_PORT \
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

# The chain named in .env keeps the example host ports (Postgres 5432, BCN 1031,
# ZMQ 28332) when they are free. Those are the ports npm run up publishes, so
# only later chains move. A chain that already has a hosts line publishes those
# ports again. Every recorded line counts as taken, including a chain this
# command starts again, so an earlier chain cannot bind those ports while the
# holder is still up.
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

# CHAIN bcn pg zmq rpc for every stack that already published host ports.
# Read before the per-chain loop rewrites /tmp/bcn-regtest-*.env.
port_note=$(mktemp)
trap 'rm -f "$port_note"' EXIT

note_has() {
  note_chain=$1
  grep -qE "^${note_chain} " "$port_note"
}

# Ignore a line that is not four numeric host ports. The first line for a chain wins.
note_add() {
  note_chain=$(printf '%s' "$1" | tr '[:lower:]' '[:upper:]')
  note_bcn=${2:-}
  note_pg=${3:-}
  note_zmq=${4:-}
  note_rpc=${5:-}
  case "$note_chain" in
    ''|*[!A-Z0-9]*) return 0 ;;
  esac
  if [ -z "$note_bcn" ] || [ -z "$note_pg" ] || [ -z "$note_zmq" ] || [ -z "$note_rpc" ]; then
    return 0
  fi
  case "${note_bcn}${note_pg}${note_zmq}${note_rpc}" in
    *[!0-9]*) return 0 ;;
  esac
  if note_has "$note_chain"; then
    return 0
  fi
  printf '%s %s %s %s %s\n' "$note_chain" "$note_bcn" "$note_pg" "$note_zmq" "$note_rpc" >> "$port_note"
  used_bcn="$used_bcn $note_bcn"
  used_pg="$used_pg $note_pg"
  used_zmq="$used_zmq $note_zmq"
  used_rpc="$used_rpc $note_rpc"
}

if [ -f "$hosts_file" ]; then
  while IFS= read -r host_line || [ -n "$host_line" ]; do
    [ -n "$host_line" ] || continue
    note_add \
      "$(printf '%s\n' "$host_line" | awk '{print $1}')" \
      "$(printf '%s\n' "$host_line" | awk '{print $2}')" \
      "$(printf '%s\n' "$host_line" | awk '{print $3}')" \
      "$(printf '%s\n' "$host_line" | awk '{print $4}')" \
      "$(printf '%s\n' "$host_line" | awk '{print $5}')"
  done < "$hosts_file"
fi

# A stack recorded before .regtest/hosts existed still holds the ports in its env file.
if [ -s "$stacks_file" ]; then
  while IFS= read -r recorded || [ -n "$recorded" ]; do
    recorded=$(printf '%s' "$recorded" | tr '[:lower:]' '[:upper:]')
    case "$recorded" in
      ''|*[!A-Z0-9]*) continue ;;
    esac
    if note_has "$recorded"; then
      continue
    fi
    recorded_lower=$(printf '%s' "$recorded" | tr '[:upper:]' '[:lower:]')
    recorded_env="/tmp/bcn-regtest-${recorded_lower}.env"
    if [ ! -f "$recorded_env" ]; then
      continue
    fi
    note_add "$recorded" \
      "$(env_value "$recorded_env" BCN_HOST_PORT)" \
      "$(env_value "$recorded_env" POSTGRES_HOST_PORT)" \
      "$(env_value "$recorded_env" BCN_ZMQ_HOST_PORT)" \
      "$(env_value "$recorded_env" BITCOIN_RPC_HOST_PORT)"
  done < "$stacks_file"
fi

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

  # The example env's RPC password matches this example conf. Mount that copy
  # from a path this script owns under the package, which Docker can read.
  # /tmp is not shared with Docker Desktop: a bind mount there becomes an
  # empty directory. The package-root conf stays in place for npm run up.
  # *.conf is gitignored, so a fresh checkout has no bitcoin.conf, and a
  # litecoin.conf whose rpcauth was replaced would not match this password.
  conf_file=$(env_value "$out" BITCOIN_CONF_FILE)
  case "$conf_file" in
    ''|*[!A-Za-z0-9._-]*)
      echo "$example has no usable BITCOIN_CONF_FILE." >&2
      exit 1
      ;;
  esac
  conf_example="chain-setup/$chain/regtest/${conf_file}.example"
  if [ ! -f "$conf_example" ]; then
    echo "No regtest conf for $chain ($conf_example)." >&2
    exit 1
  fi
  mkdir -p .regtest
  conf_out="$(pwd)/.regtest/$lower.conf"
  cp "$conf_example" "$conf_out"
  set_key "$out" BITCOIN_CONF_HOST_FILE "$conf_out"

  bcn_port=$(env_value "$out" BCN_PORT)
  pg_port=$(env_value "$out" POSTGRES_PORT)
  zmq_port=$(env_value "$out" BCN_ZMQ_PORT)
  rpc_port=$(env_value "$out" BITCOIN_RPC_PORT)
  if [ -z "$bcn_port" ] || [ -z "$pg_port" ] || [ -z "$zmq_port" ] || [ -z "$rpc_port" ]; then
    echo "$example is missing BCN_PORT, POSTGRES_PORT, BCN_ZMQ_PORT, or BITCOIN_RPC_PORT." >&2
    exit 1
  fi

  # A recorded chain publishes the same four host ports. They are already in
  # the used sets, so a chain earlier in this list cannot have taken them.
  # A chain with no line takes the next free port, and that port stays taken.
  held_line=''
  if note_has "$chain"; then
    held_line=$(grep -E "^${chain} " "$port_note" | head -n 1 || true)
  fi
  if [ -n "$held_line" ]; then
    bcn_host=$(printf '%s\n' "$held_line" | awk '{print $2}')
    pg_host=$(printf '%s\n' "$held_line" | awk '{print $3}')
    zmq_host=$(printf '%s\n' "$held_line" | awk '{print $4}')
    rpc_host=$(printf '%s\n' "$held_line" | awk '{print $5}')
  else
    bcn_host=$(next_free "$bcn_port" "$used_bcn")
    pg_host=$(next_free "$pg_port" "$used_pg")
    zmq_host=$(next_free "$zmq_port" "$used_zmq")
    rpc_host=$(next_free "$rpc_port" "$used_rpc")
    used_bcn="$used_bcn $bcn_host"
    used_pg="$used_pg $pg_host"
    used_zmq="$used_zmq $zmq_host"
    used_rpc="$used_rpc $rpc_host"
  fi

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
    record_stack "$chain"
    record_hosts "$chain" "$bcn_host" "$pg_host" "$zmq_host" "$rpc_host"
  else
    docker compose -p "$project" -f docker-compose.yml --env-file "$out" down
    forget_stack "$chain"
    forget_hosts "$chain"
  fi
done
