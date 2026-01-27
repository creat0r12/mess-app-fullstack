const db = require("../db");

/* =========================
   SUBMIT STUDENT LEAVE
========================= */
exports.submitLeave = (req, res) => {
  const userId = req.user.id; // 🔥 JWT user id
  const { leave_date, reason } = req.body;

  // 1️⃣ Allow only today or tomorrow
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  if (![today, tomorrow].includes(leave_date)) {
    return res.status(400).json({
      message: "Leave can be requested only for today or tomorrow",
    });
  }

  // 2️⃣ Prevent multiple active leaves
  db.query(
    `
    SELECT id
    FROM student_leaves
    WHERE user_id = ?
      AND status IN ('PENDING', 'APPROVED')
    LIMIT 1
    `,
    [userId],
    (err, existing) => {
      if (err) {
        console.error("Leave check error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (existing.length > 0) {
        return res.status(400).json({
          message: "You already have an active leave request",
        });
      }

      // 3️⃣ Insert leave
      db.query(
        `
        INSERT INTO student_leaves
          (user_id, leave_date, reason, status)
        VALUES (?, ?, ?, 'PENDING')
        `,
        [userId, leave_date, reason || null],
        (err2) => {
          if (err2) {
            console.error("Leave insert error:", err2);
            return res
              .status(500)
              .json({ message: "Failed to submit leave" });
          }

          res.json({
            message: "Leave request submitted successfully",
          });
        }
      );
    }
  );
};

/* =========================
   GET OWN LEAVE STATUS
========================= */
exports.getMyLeave = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT leave_date, status, reason, returned_at
FROM student_leaves
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 1

    `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Get leave error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(rows[0] || null);
    }
  );
};


/* =========================
   CONFIRM RETURN (STUDENT)
========================= */
exports.confirmReturn = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    UPDATE student_leaves
SET status = 'RETURNED',
    verified_at = NOW(),
    returned_at = NOW()
WHERE user_id = ? AND status = 'RETURN_REQUESTED'

    `,
    [userId],
    (err, result) => {
      if (err) {
        console.error("Confirm return error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "No return request to confirm",
        });
      }

      res.json({ message: "Return confirmed" });
    }
  );
};
