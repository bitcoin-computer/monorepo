import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const pgp = pgPromise();
const connectionConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "", 10),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  schema: "public",
};

const db = pgp(connectionConfig);

export { db };
