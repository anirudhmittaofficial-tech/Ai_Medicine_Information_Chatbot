const { Pool } = require("pg");
require("dotenv").config();

// Use DATABASE_URL if provided (e.g., by Render/Neon), otherwise fallback to individual variables
let dbConfig;

if (process.env.DATABASE_URL) {
  // Strip ?sslmode=... from the URL — pg handles SSL via the ssl object below
  const connectionString = process.env.DATABASE_URL.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, "");

  dbConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: true, // Neon requires verified TLS (verify-full)
    },
    // Pool resilience settings for cloud DB (Neon)
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(dbConfig);

// Prevent unhandled 'error' event from crashing the process on idle client errors
pool.on("error", (err) => {
  console.error("⚠️  Unexpected PostgreSQL pool error:", err.message);
});

pool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL Connected");
    client.release();
  })
  .catch((err) => console.error("❌ DB Connection Error:", err.message));

module.exports = pool;