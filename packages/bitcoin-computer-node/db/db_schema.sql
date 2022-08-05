CREATE TABLE IF NOT EXISTS
  "NonStandard" (
    "id" VARCHAR(70) NOT NULL,
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY,
    "publicKeys" VARCHAR(66)[],
    "classHash" VARCHAR(64),
    "spent" BOOLEAN NOT NULL DEFAULT FALSE
  );

CREATE TABLE IF NOT EXISTS
  "Standard" (
    "address" VARCHAR(66) NOT NULL,
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY,
    "satoshis" BIGINT NOT NULL,
    "scriptPubKey" TEXT NOT NULL,
    "spent" BOOLEAN NOT NULL DEFAULT FALSE
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
  "Sync" (
    "oneRowId" bool PRIMARY KEY DEFAULT TRUE,
    "syncedHeight" INTEGER NOT NULL,
    "bitcoindSyncedHeight" INTEGER NOT NULL,
    "bitcoindSyncedProgress" DECIMAL(10,9) NOT NULL,
    CONSTRAINT "OneRowUni" CHECK ("oneRowId")
  );
INSERT INTO
  "Sync" (
    "syncedHeight",
    "bitcoindSyncedHeight",
    "bitcoindSyncedProgress"
  )
  VALUES (-1, -1, 0);

CREATE VIEW "Utxos" AS
  SELECT coalesce(su.rev, nst.rev) AS rev, su.spent AS "stSpent", nst.spent AS "nstSpent"
  FROM "Standard" su FULL JOIN "NonStandard" nst ON su.rev = nst.rev ;
