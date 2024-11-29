CREATE TABLE IF NOT EXISTS
  "Games" (
    "id" VARCHAR(70) NOT NULL PRIMARY KEY,
    "gameId" VARCHAR(66),
    "publicKeyW" VARCHAR(66),
    "publicKeyB" VARCHAR(66),
    "secretW" VARCHAR(66),
    "secretB" VARCHAR(66)
  );