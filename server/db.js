const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 🔐 Read CA cert (IMPORTANT)
const caCert = fs.readFileSync(
  path.join(__dirname, "certs", "ca.pem")
);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: caCert
   
  },

  waitForConnections: true,
  connectionLimit: 10,
});

// ✅ Test connection
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Aiven MySQL connection failed:", err);
  } else {
    console.log("✅ Aiven MySQL connected successfully");
    conn.release();
  }
});

module.exports = db;