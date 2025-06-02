#!/bin/bash
set -e

LOG_FILE="db/index_creation_$(date '+%Y%m%d_%H%M%S').log"

set -o allexport
source .env
set +o allexport

echo "Target database: $POSTGRES_DB" | tee -a "$LOG_FILE"

INDEX_LIST=$(cat <<EOF
Output.address|idx_output_address|CREATE INDEX idx_output_address ON "Output"(address);
Output.previous|idx_output_previous|CREATE INDEX idx_output_previous ON "Output"(previous);
Output.isTbcOutput|idx_output_istbcoutput|CREATE INDEX idx_output_istbcoutput ON "Output"("isTbcOutput");
Output.blockHash|idx_output_blockhash|CREATE INDEX idx_output_blockhash ON "Output"("blockHash");
Output.asm|idx_output_asm|CREATE INDEX idx_output_asm ON "Output"("asm");
Output.mod|idx_output_mod|CREATE INDEX idx_output_mod ON "Output"("mod");
Orphan.height|idx_orphan_height|CREATE INDEX idx_orphan_height ON "Orphan"(height);
Input.outputSpent|idx_input_outputSpent|CREATE INDEX idx_input_outputSpent ON "Input"("outputSpent");
Input.blockHash|idx_input_blockhash|CREATE INDEX idx_input_blockhash ON "Input"("blockHash");
Block.height|idx_block_height|CREATE INDEX idx_block_height ON "Block"(height);
EOF
)
# Detect PostgreSQL container
POSTGRES_CONTAINER=$(docker ps --filter "ancestor=postgres" --format "{{.ID}}" | head -n 1)

if [ -z "$POSTGRES_CONTAINER" ]; then
  echo "No running PostgreSQL container found." | tee -a "$LOG_FILE"
  exit 1
fi

# Check if index exists
index_exists() {
  local index_name=$1
  docker exec -i "$POSTGRES_CONTAINER" env PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
    "SELECT to_regclass('$index_name') IS NOT NULL;"
}

# Execute SQL with timing
execute_sql() {
  local description=$1
  local index_name=$2
  local sql=$3

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Checking index: $index_name ($description)" | tee -a "$LOG_FILE"
  if [[ "$(index_exists "$index_name")" == "t" ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Skipping $description — index '$index_name' already exists." | tee -a "$LOG_FILE"
    echo "-------------------------------------------------------------" | tee -a "$LOG_FILE"
    return
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Creating index: $description" | tee -a "$LOG_FILE"
  local start_time=$(date +%s)

  docker exec -i "$POSTGRES_CONTAINER" env PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<EOF >>"$LOG_FILE" 2>&1
$sql
EOF

  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Finished: $description (Duration: ${duration}s)" | tee -a "$LOG_FILE"
  echo "-------------------------------------------------------------" | tee -a "$LOG_FILE"
}

# Loop and split key using "|"
IFS=$'\n'
for line in $INDEX_LIST; do
  description=$(echo "$line" | cut -d'|' -f1)
  index_name=$(echo "$line" | cut -d'|' -f2)
  sql=$(echo "$line" | cut -d'|' -f3)
  execute_sql "$description" "$index_name" "$sql"
done
