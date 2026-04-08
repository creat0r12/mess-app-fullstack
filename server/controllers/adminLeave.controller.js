const db = require("../db");

/* ================= GET LEAVES ================= */
const getStudentLeaves = (req, res) => {
  const { status } = req.query;
  const adminId = req.user.id;

  let sql = `
    SELECT 
      sl.id,
      sl.leave_date,
      sl.reason,
      sl.status,
      sl.created_at,
      sl.verified_at,
      u.name AS student_name,
      u.phone
    FROM student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN users u ON smm.user_id = u.id
    JOIN messes m ON smm.mess_id = m.id
    WHERE m.owner_user_id = ?
  `;

  const params = [adminId];

  if (status) {
    sql += " AND sl.status = ?";
    params.push(status);
  }

  sql += " ORDER BY sl.created_at DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Get Leaves Error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json(rows);
  });
};

/* ================= APPROVE LEAVE ================= */
const approveLeave = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    SET sl.status='APPROVED', sl.verified_at=NOW()
    WHERE sl.id=? AND m.owner_user_id=?
    `,
    [id, adminId],
    (err) => {
      if (err) {
        console.error("Approve Leave Error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json({ message: "Leave approved" });
    }
  );
};

/* ================= REJECT LEAVE ================= */
const rejectLeave = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    SET sl.status='REJECTED', sl.verified_at=NOW()
    WHERE sl.id=? AND m.owner_user_id=?
    `,
    [id, adminId],
    (err) => {
      if (err) {
        console.error("Reject Leave Error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json({ message: "Leave rejected" });
    }
  );
};

/* ================= REQUEST RETURN ================= */
const requestReturn = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE student_leaves sl
    JOIN student_mess_membership smm ON sl.membership_id = smm.id
    JOIN messes m ON smm.mess_id = m.id
    SET sl.status='RETURN_REQUESTED', sl.verified_at=NOW()
    WHERE sl.id=? AND sl.status='APPROVED' AND m.owner_user_id=?
    `,
    [id, adminId],
    (err, result) => {
      if (err) {
        console.error("Request Return Error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "Return request allowed only for approved leaves",
        });
      }

      res.json({ message: "Return request sent to student" });
    }
  );
};

/* ================= EXPORTS ================= */
module.exports = {
  getStudentLeaves,
  approveLeave,
  rejectLeave,
  requestReturn,
};
