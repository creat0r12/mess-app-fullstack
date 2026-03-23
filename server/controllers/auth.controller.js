const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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
    "SELECT id, status, password FROM users WHERE phone = ?",
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
        "UPDATE users SET password = ? WHERE id = ?",
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



exports.platformLogin = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const sql = `
    SELECT *
    FROM users
    WHERE role = 'PLATFORM_ADMIN'
      AND email = ?
    LIMIT 1
  `;

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("PLATFORM LOGIN ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
    });
  });
};




/* =========================
   UNIFIED LOGIN (STUDENT + ADMIN)
========================= */
exports.loginUser = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier) {
    return res.status(400).json({
      message: "Phone or Email is required",
    });
  }

  const sql = `
  SELECT 
    u.id,
    u.name,
    u.phone,
    u.email,
    u.password,
    u.role,
    u.status,
    m.id AS mess_id
  FROM users u
  LEFT JOIN messes m ON m.owner_user_id = u.id
  WHERE (u.email = ? OR u.phone = ?)
  LIMIT 1
`;

  db.query(sql, [identifier, identifier], async (err, results) => {
    if (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({
        message: "User not found. Contact your mess admin.",
      });
    }

    const user = results[0];



    /* =========================
   FIRST TIME LOGIN (NO PASSWORD)
========================= */
    if (!user.password) {
      // ✅ Only block STUDENTS
      if (user.role === "STUDENT" && user.status !== "ACTIVE") {
        return res.status(403).json({
          message: "You are not approved by any mess yet",
        });
      }

      return res.json({
        firstLogin: true,
        phone: user.phone,
      });
    }

    /* =========================
       PASSWORD REQUIRED
    ========================= */
    if (!password) {
      // ✅ Only block STUDENTS
      if (user.role === "STUDENT" && user.status !== "ACTIVE") {
        return res.status(403).json({
          message: "You are not approved by any mess yet",
        });
      }

      return res.json({
        firstLogin: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* =========================
       GENERATE TOKEN
    ========================= */
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        mess_id: user.mess_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      role: user.role,
      mess_id: user.mess_id || null,
    });
  });
};