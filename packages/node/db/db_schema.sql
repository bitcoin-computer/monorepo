CREATE TABLE IF NOT EXISTS
  "Output" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY,
    "address" VARCHAR(66),
    "satoshis" BIGINT NOT NULL,
    "scriptPubKey" TEXT NOT NULL,
    "publicKeys" VARCHAR(66)[]
  );

CREATE TABLE IF NOT EXISTS
  "Input" (
    "outputSpent" VARCHAR(70) NOT NULL PRIMARY KEY,
    "spendingInput" VARCHAR(70) NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  "NonStandard" (
    "lastUpdated" timestamp default CURRENT_TIMESTAMP not null,
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY REFERENCES "Output"("rev") ON DELETE RESTRICT,
    "id" VARCHAR(70) NOT NULL,
    "publicKeys" VARCHAR(66)[],
    "hash" VARCHAR(64),
    "mod" VARCHAR(70)
  );

CREATE TABLE IF NOT EXISTS
  "RevToId" (
    "rev" VARCHAR(70) NOT NULL PRIMARY KEY REFERENCES "Output"("rev") ON DELETE RESTRICT,
    "id" VARCHAR(70) NOT NULL
  );

CREATE OR REPLACE FUNCTION triggerSetTimestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastUpdated" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER updateNonStandardLastUpdated
  BEFORE UPDATE
  ON
    "NonStandard"
  FOR EACH ROW
EXECUTE PROCEDURE triggerSetTimestamp();

CREATE UNIQUE INDEX "NonStandardUniqueIndex"
ON "NonStandard"("id");

CREATE INDEX "NonStandardPublicKeysIndex"
ON "NonStandard"("publicKeys");

CREATE INDEX "NonStandardHashIndex"
ON "NonStandard"("hash");

CREATE INDEX "NonStandardModIndex"
ON "NonStandard"("mod");

CREATE INDEX "OutputAddressIndex"
ON "Output"("address");

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
    "syncedHeight" INTEGER NOT NULL,
    "workerId" INTEGER NOT NULL PRIMARY KEY
  );

CREATE VIEW "Utxos" AS
SELECT "rev", "address", "satoshis", "scriptPubKey", "publicKeys"
FROM "Output" WHERE NOT EXISTS
(SELECT 1 FROM "Input" ip WHERE "ip"."outputSpent" = "Output".rev
union
select 1 from "NonStandard" ns where "ns"."rev" = "Output".rev)

