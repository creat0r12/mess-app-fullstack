const jwt = require("jsonwebtoken");
const db = require("../db");

/* =========================
   BASE AUTH (JWT VERIFY)
========================= */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, mess_id }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* =========================
   ADMIN AUTH (ADMIN + MESS_ADMIN)
========================= */
const adminAuth = (req, res, next) => {
  authenticate(req, res, () => {
    if (!["PLATFORM_ADMIN", "MESS_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  });
};



/* =========================
   STUDENT AUTH (WITH MEMBERSHIP)
========================= */
const studentAuth = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Student access only" });
    }

    // 🔹 Fetch active membership for this student
    db.query(
      `
      SELECT id
      FROM student_mess_membership
      WHERE user_id = ?
        AND status = 'ACTIVE'
      LIMIT 1
      `,
      [req.user.id],
      (err, rows) => {
        if (err) {
          console.error("STUDENT AUTH ERROR:", err);
          return res.status(500).json({ message: "DB error" });
        }

        if (!rows.length) {
          return res
            .status(403)
            .json({ message: "No active mess membership found" });
        }

        // ✅ Attach membership_id to req.user
        req.user.membership_id = rows[0].id;

        next();
      }
    );
  });
};

module.exports = {
  authenticate,
  adminAuth,
  studentAuth,
};
