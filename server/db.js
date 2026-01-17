const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// test connection once
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Local MySQL connection failed:", err.message);
  } else {
    console.log("✅ Local MySQL connected");
    conn.release();
  }
});

module.exports = db;
