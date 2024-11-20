CREATE TABLE IF NOT EXISTS
  "Games" (
    "id" VARCHAR(70) NOT NULL PRIMARY KEY,
    "gameId" VARCHAR(66),
    "firstPlayerPubKey" VARCHAR(66),
    "secondPlayerPubKey" VARCHAR(66),
    "firstPlayerHash" VARCHAR(66),
    "secondPlayerHash" VARCHAR(66)
  );