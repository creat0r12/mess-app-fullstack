const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// 🔐 Read SSL certificate (NO utf8 here)
const caCert = fs.readFileSync(
  path.join(__dirname, "certs", "ca.pem")
);

// 📦 Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), // 🔥 ensure it's number
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: caCert,
    minVersion: "TLSv1.2", // 🔥 important for Aiven
    rejectUnauthorized: true, // 🔥 strict first
  },
});

// 📂 Read SQL dump file
const sql = fs.readFileSync(
  path.join(__dirname, "Dump20260408.sql"),
  "utf8"
);

// 🚀 Connect + Import
connection.connect((err) => {
  if (err) {
    console.error("❌ Connection failed:", err);
    return;
  }

  console.log("✅ Connected to Aiven DB");

  connection.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Import failed:", err);
    } else {
      console.log("✅ Database imported successfully");
    }

    connection.end();
  });
});