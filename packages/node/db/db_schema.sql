CREATE TABLE IF NOT EXISTS
  "Output" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY,
    "address" VARCHAR(66),
    "satoshis" BIGINT NOT NULL,
    "scriptPubKey" TEXT NOT NULL,
    "isTbcOutput" BOOLEAN NOT NULL,
    "publicKeys" VARCHAR(66)[],
    "mod" VARCHAR(70),
    "previous" VARCHAR(70),
    "hash" VARCHAR(64),
    "timestamp" timestamp default CURRENT_TIMESTAMP not null
  );

CREATE TABLE IF NOT EXISTS
  "Input" (
    "outputSpent" VARCHAR(70) NOT NULL PRIMARY KEY,
    "spendingInput" VARCHAR(70) NOT NULL
  );

CREATE INDEX "OutputAddressIndex"
ON "Output"("address");

CREATE INDEX "OutputPreviousIndex"
ON "Output"("previous");

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
  "SyncStatus" (
    "blockToSync" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL PRIMARY KEY
  );

CREATE VIEW "Utxos" AS
SELECT "rev", "address", "satoshis", "scriptPubKey", "publicKeys", "timestamp"
FROM "Output" WHERE "isTbcOutput" = false AND NOT EXISTS
(SELECT 1 FROM "Input" ip WHERE "ip"."outputSpent" = "Output"."rev")

