#!/bin/bash

# Load environment variables from .env
if [ -f /home/ubuntu/monorepo/packages/node/.env ]; then
  export $(grep -v '^#' /home/ubuntu/monorepo/packages/node/.env | xargs)
fi

# Executes a shell command in the DB container
execDbCommand() {
  local command=$1
  local containerIdDb=$(docker ps -qf "ancestor=postgres")
  if [ -z "$containerIdDb" ]; then
    echo "Failed to find PostgreSQL container."
    exit 1
  fi
  docker exec "$containerIdDb" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$command"
}

# Executes a shell command in the Node container
execNodeCommand() {
  local command=$1
  local containerIdNode=$(docker ps -qf "ancestor=$BITCOIN_IMAGE")
  if [ -z "$containerIdNode" ]; then
    echo "Failed to find Node container."
    exit 1
  fi
  docker exec "$containerIdNode" /bin/bash -c "$command"
}

# Gets the debug path based on the network
getDebugPath() {
  case "$BCN_NETWORK" in
    "mainnet") echo "$BITCOIN_DATA_DIR/debug.log" ;;
    "testnet") echo "$BITCOIN_DATA_DIR/testnet4/debug.log" ;;
    "regtest") echo "$BITCOIN_DATA_DIR/regtest/debug.log" ;;
    *) echo "Invalid network" && exit 1 ;;
  esac
}

# Helper function to format seconds into HH:MM:SS
format_elapsed_time() {
  local total_seconds=$1
  local hours=$((total_seconds / 3600))
  local minutes=$(( (total_seconds % 3600) / 60 ))
  local seconds=$((total_seconds % 60))
  printf "%02d:%02d:%02d" "$hours" "$minutes" "$seconds"
}

# Main script
main() {
  # Format the date and time
  local formattedDateTime=$(date '+%Y-%m-%d %H:%M:%S')

  # Node
  local debugPath=$(getDebugPath)
  local nodeOutput=$(execNodeCommand "cat $debugPath | tail -1000 | grep 'UpdateTip' | tail -n 1")
  local nodeHeight=$(echo "$nodeOutput" | sed -n 's/.*height=\([0-9]*\).*/\1/p' || echo "N/A")
  local progress=$(echo "$nodeOutput" | sed -n 's/.*progress=\([0-9.]*\).*/\1/p' || echo "N/A")

  if [ "$nodeHeight" == "N/A" ] || [ -z "$progress" ]; then
    echo "Failed to extract node metrics."
    exit 1
  fi

  local progressPercent=$(awk "BEGIN { printf \"%.2f\", $progress * 100 }")
  local nodeHeightK=$(echo "$nodeHeight" | sed 's/...$//')

  # Coordinator
  local coordinatorDbHeight=$(execDbCommand 'select bs."blockToSync" from "BlockStatus" bs LIMIT 1' | sed -n '3p' | xargs)
  local coordinatorProgress="N/A"
  local coordinatorHeightK="N/A"

  if [[ "$coordinatorDbHeight" =~ ^[0-9]+$ && "$nodeHeight" =~ ^[0-9]+$ ]]; then
    coordinatorProgress=$(awk "BEGIN { printf \"%.2f\", $progress * 100 * $coordinatorDbHeight / $nodeHeight }")
    coordinatorHeightK=$(echo "$coordinatorDbHeight" | sed 's/...$//')
  fi

  # Workers
  local workersDbHeight=$(execDbCommand 'select max(ts."blockToSync") as max from "TxStatus" ts' | sed -n '3p' | xargs)
  local workersProgress="N/A"
  local workersHeightK="N/A"

  if [[ "$workersDbHeight" =~ ^[0-9]+$ && "$nodeHeight" =~ ^[0-9]+$ ]]; then
    workersProgress=$(awk "BEGIN { printf \"%.2f\", $progress * 100 * $workersDbHeight / $nodeHeight }")
    workersHeightK=$(echo "$workersDbHeight" | sed 's/...$//')
  fi

  # Generate Markdown table
  local metricsFile="/tmp/metrics.log"
  if [ ! -f "$metricsFile" ]; then
    # First run: Write the initial timestamp to the file
    local initialTime=$(date +%s)
    echo "initial_time:$initialTime" > "$metricsFile"
    echo "$formattedDateTime" >> "$metricsFile"
    echo "|        Time         |       Node (K)     |   Coordinator (K)  |     Workers (K)   |" >> "$metricsFile"
    echo "|---------------------|--------------------|--------------------|-------------------|" >> "$metricsFile"
  fi

  # Read the initial time from the file
  local initialTime=$(grep 'initial_time:' "$metricsFile" | cut -d':' -f2)

  # Calculate elapsed time relative to the initial time
  local currentTime=$(date +%s)
  local elapsedTime=$((currentTime - initialTime))

  # Format elapsed time as HH:MM:SS
  local formattedElapsedTime=$(format_elapsed_time "$elapsedTime")


  # Append the metrics to the file
  printf "| %s | %9s (%5s%%) | %9s (%5s%%) | %8s (%5s%%) | %12s |\n" \
    "$formattedElapsedTime" "$nodeHeightK" "$progressPercent" \
    "$coordinatorHeightK" "$coordinatorProgress" \
    "$workersHeightK" "$workersProgress" >> "$metricsFile"

  # Log to stdout
  cat "$metricsFile"
}

main
