const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 🔐 Load CA certificate safely (only if exists)
let sslConfig = null;

try {
  const caPath = path.join(__dirname, "certs", "ca.pem");

  if (fs.existsSync(caPath)) {
    const caCert = fs.readFileSync(caPath);

    sslConfig = {
  ca: caCert,
  minVersion: "TLSv1.2",
  servername: process.env.DB_HOST, // 🔥 THIS IS THE KEY FIX
};

    console.log("🔐 SSL enabled using CA certificate");
  } else {
    console.log("⚠️ CA certificate not found, trying without SSL (dev mode)");
  }
} catch (err) {
  console.log("⚠️ SSL setup failed, fallback to non-SSL:", err.message);
}

// 🔥 Create pool (production ready)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: sslConfig,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ✅ Better connection test
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ DB CONNECTION FAILED");
    console.error("CODE:", err.code);
    console.error("MESSAGE:", err.message);
  } else {
    console.log("✅ Aiven MySQL connected successfully");
    conn.release();
  }
});

module.exports = db;