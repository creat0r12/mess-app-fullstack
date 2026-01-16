const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* =========================
   ADMIN LOGIN (FINAL)
========================= */
exports.loginAdmin = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const sql = `
    SELECT * FROM admins
    WHERE email = ? OR username = ?
    LIMIT 1
  `;

  db.query(sql, [identifier, identifier], async (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: "ADMIN",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  });
};











/* =========================
   STUDENT LOGIN
========================= */
exports.studentLogin = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      message: "Phone/Name and password are required",
    });
  }

  const sql = `
    SELECT *
    FROM students
    WHERE status = 'ACTIVE'
      AND (phone = ? OR name = ?)
    LIMIT 1
  `;

  db.query(sql, [identifier, identifier], async (err, results) => {
    if (err) {
      console.error("STUDENT LOGIN ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials or account not approved",
      });
    }

    const student = results[0];

    // 🔑 PASSWORD NOT SET YET → FIRST LOGIN
    if (!student.password) {
      return res.json({
        firstLogin: true,
        phone: student.phone,
      });
    }

    // 🔐 Compare hashed password
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      message: "Login successful",
      student: {
        id: student.id,
        name: student.name,
        phone: student.phone,
        gender: student.gender,
      },
    });
  });
};




/* =========================
   SET STUDENT PASSWORD
========================= */
exports.setStudentPassword = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password required" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  db.query(
    "SELECT id, status, password FROM students WHERE phone = ?",
    [phone],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = results[0];

      if (student.status !== "ACTIVE") {
        return res.status(403).json({
          message: "Student not approved yet",
        });
      }

      if (student.password) {
        return res.status(400).json({
          message: "Password already set",
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE students SET password = ? WHERE id = ?",
        [hashed, student.id],
        (err2) => {
          if (err2) {
            return res.status(500).json({
              message: "Failed to set password",
            });
          }

          res.json({
            message: "Password set successfully. You can now login.",
          });
        }
      );
    }
  );
};
