CREATE TABLE IF NOT EXISTS
  "Output" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY,
    "address" VARCHAR(66),
    "satoshis" BIGINT NOT NULL,
    "scriptPubKey" TEXT NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "Input" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY
  );

CREATE TABLE IF NOT EXISTS
  "NonStandard" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY REFERENCES "Output"("rev") ON DELETE RESTRICT,
    "id" VARCHAR(70) NOT NULL,
    "publicKeys" VARCHAR(66)[],
    "classHash" VARCHAR(64)
  );

CREATE UNIQUE INDEX "NonStandardUniqueIndex"
ON "NonStandard"("id");

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
    "oneRowId" bool PRIMARY KEY DEFAULT TRUE,
    "syncedHeight" INTEGER NOT NULL,
    "bitcoindSyncedHeight" INTEGER NOT NULL,
    "bitcoindSyncedProgress" DECIMAL(10,9) NOT NULL,
    CONSTRAINT "OneRowUni" CHECK ("oneRowId")
  );
INSERT INTO
  "SyncStatus" (
    "syncedHeight",
    "bitcoindSyncedHeight",
    "bitcoindSyncedProgress"
  )
  VALUES (-1, -1, 0);

CREATE VIEW "Utxos" AS  
SELECT "rev", "address", "satoshis", "scriptPubKey" 
FROM "Output" WHERE NOT EXISTS 
(SELECT ip.rev FROM "Input" ip  WHERE ip.rev = "Output".rev)
