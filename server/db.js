const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// test connection once
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Aiven MySQL connection failed:", err.message);
  } else {
    console.log("✅ Aiven MySQL connected successfully");
    conn.release();
  }
});

module.exports = db;