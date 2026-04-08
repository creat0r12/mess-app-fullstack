const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync("ca.pem"),   // IMPORTANT
  },
});

const sql = fs.readFileSync("Dump20260408.sql", "utf8");

connection.query(sql, (err, result) => {
  if (err) {
    console.error("❌ Import failed:", err);
  } else {
    console.log("✅ Database imported successfully");
  }
  connection.end();
});