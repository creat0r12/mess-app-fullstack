const db = require("../db");

/* =========================
   SUBMIT STUDENT LEAVE
========================= */
exports.submitLeave = (req, res) => {
  const membershipId = req.user.membership_id;
  const { leave_date, reason } = req.body;

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000)
    .toISOString()
    .slice(0, 10);

  // Allow only today or tomorrow
  if (![today, tomorrow].includes(leave_date)) {
    return res.status(400).json({
      message: "Leave can be requested only for today or tomorrow",
    });
  }

  // Prevent multiple active leaves
  db.query(
    `
    SELECT id
    FROM student_leaves
    WHERE membership_id = ?
      AND status IN ('PENDING', 'APPROVED', 'RETURN_REQUESTED')
    LIMIT 1
    `,
    [membershipId],
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

      // Insert leave
      db.query(
        `
        INSERT INTO student_leaves (membership_id, leave_date, reason, status, created_at)
        VALUES (?, ?, ?, 'PENDING', NOW())
        `,
        [membershipId, leave_date, reason || null],
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
  const membershipId = req.user.membership_id;

  db.query(
    `
    SELECT 
      leave_date,
      actual_leave_date,
      status,
      reason,
      returned_at,
      actual_return_date
    FROM student_leaves
    WHERE membership_id = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [membershipId],
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
  const membershipId = req.user.membership_id;

  db.query(
    `
    UPDATE student_leaves
    SET status = 'RETURNED',
        verified_at = NOW(),
        returned_at = NOW(),
        actual_return_date = NOW()
   WHERE membership_id = ?
AND status = 'RETURN_REQUESTED'
ORDER BY created_at DESC
LIMIT 1
    `,
    [membershipId],
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

/* =========================
   ADMIN: APPROVE LEAVE
========================= */
exports.approveLeave = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    SET sl.status = 'APPROVED',
        sl.approved_at = NOW(),
        sl.actual_leave_date = sl.leave_date
    WHERE sl.id = ?
      AND m.owner_user_id = ?
    `,
    [id, adminId],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Leave approved" });
    }
  );
};

/* =========================
   ADMIN: REJECT LEAVE
========================= */
exports.rejectLeave = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    SET sl.status = 'REJECTED',
        sl.rejected_at = NOW()
    WHERE sl.id = ?
      AND m.owner_user_id = ?
    `,
    [id, adminId],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Leave rejected" });
    }
  );
};

/* =========================
   ADMIN: REQUEST RETURN
========================= */
exports.requestReturn = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    SET sl.status = 'RETURN_REQUESTED'
    WHERE sl.id = ?
      AND m.owner_user_id = ?
    `,
    [id, adminId],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Return requested" });
    }
  );
};

/* =========================
   ADMIN: LEAVE STATS
========================= */
exports.getLeaveStats = (req, res) => {
  const adminId = req.user.id;

  db.query(
    `
    SELECT COUNT(*) AS active_leaves
    FROM student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    WHERE m.owner_user_id = ?
      AND sl.status IN ('PENDING', 'APPROVED', 'RETURN_REQUESTED')
    `,
    [adminId],
    (err, rows) => {
      if (err) {
        console.error("Leave stats error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(rows[0] || { active_leaves: 0 });
    }
  );
};

/* =========================
   GET FULL LEAVE HISTORY (STUDENT)
========================= */
exports.getMyLeaveHistory = (req, res) => {
  const membershipId = req.user.membership_id;

  db.query(
    `
    SELECT 
      id,
      leave_date,
      actual_leave_date,
      status,
      reason,
      created_at,
      approved_at,
      rejected_at,
      returned_at,
      actual_return_date
    FROM student_leaves
    WHERE membership_id = ?
    ORDER BY created_at DESC
    `,
    [membershipId],
    (err, rows) => {
      if (err) {
        console.error("Get leave history error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(rows || []);
    }
  );
};