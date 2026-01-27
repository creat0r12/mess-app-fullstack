const db = require("../db");

/* ================= GET LEAVES ================= */
const getStudentLeaves = (req, res) => {
  const { status } = req.query;

  let sql = `
  SELECT 
    sl.id,
    sl.leave_date,
    sl.reason,
    sl.status,
    sl.created_at,
    sl.verified_at,
    u.id AS user_id,
    u.name AS student_name,
    u.phone
  FROM student_leaves sl
  JOIN users u ON sl.user_id = u.id
`;


  const params = [];

  if (status) {
    sql += " WHERE sl.status = ?";
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

  db.query(
    `
    UPDATE student_leaves
    SET status='APPROVED', verified_at=NOW()
    WHERE id=?
    `,
    [id],
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

  db.query(
    `
    UPDATE student_leaves
    SET status='REJECTED', verified_at=NOW()
    WHERE id=?
    `,
    [id],
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

  db.query(
    `
    UPDATE student_leaves
    SET status='RETURN_REQUESTED', verified_at=NOW()
    WHERE id=? AND status='APPROVED'
    `,
    [id],
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
