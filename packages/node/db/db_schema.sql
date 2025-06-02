CREATE TABLE IF NOT EXISTS
  "Output" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY,
    "address" VARCHAR(66),
    "satoshis" BIGINT NOT NULL,
    "asm" TEXT NOT NULL,
    "isTbcOutput" BOOLEAN NOT NULL,
    "mod" VARCHAR(70),
    "previous" VARCHAR(70),
    "hash" VARCHAR(64),
    "blockHash" VARCHAR(64),
    "timestamp" timestamp default CURRENT_TIMESTAMP not null
  );

CREATE TABLE IF NOT EXISTS
  "Input" (
    "spendingInput" VARCHAR(70) NOT NULL PRIMARY KEY,
    "outputSpent" VARCHAR(70) NOT NULL,
    "blockHash" VARCHAR(64)
  );

CREATE TABLE IF NOT EXISTS
  "Block" (
    "hash" VARCHAR(64) NOT NULL PRIMARY KEY,
    "height" INTEGER NOT NULL,
    "previousHash" VARCHAR(64) NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "Orphan" (
    "hash" VARCHAR(64) NOT NULL PRIMARY KEY,
    "height" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "User" (
    "publicKey" VARCHAR(66) NOT NULL PRIMARY KEY,
    "clientTimestamp" BIGINT NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "OffChain" (
    "id" VARCHAR(64) NOT NULL PRIMARY KEY,
    "data" TEXT NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "TxStatus" (
    "blockToSync" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL PRIMARY KEY
  );

CREATE TABLE IF NOT EXISTS
  "BlockStatus" (
    "blockToSync" INTEGER NOT NULL PRIMARY KEY
  );

CREATE VIEW "Utxos" AS
SELECT "rev", "address", "satoshis", "asm", "timestamp", "blockHash"
FROM "Output" WHERE "isTbcOutput" = false AND NOT EXISTS
(SELECT 1 FROM "Input" ip WHERE "ip"."outputSpent" = "Output"."rev")

