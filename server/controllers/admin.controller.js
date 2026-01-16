const db = require("../db");

/* =========================
   PENDING STUDENTS
========================= */
exports.getPendingStudents = (req, res) => {
  db.query(
    `
    SELECT id, name, email, phone, status, created_at
    FROM students
    WHERE status = 'PENDING'
    `,
    (err, results) => {
      if (err) {
        console.error("Pending students error:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};

/* =========================
   APPROVE STUDENT
========================= */
exports.approveStudent = (req, res) => {
  const { id } = req.params;

  // 1️⃣ Activate student
  db.query(
    "UPDATE students SET status='ACTIVE' WHERE id=?",
    [id],
    (err) => {
      if (err) {
        console.error("Approve student error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      // 2️⃣ Check if payment already exists (current cycle)
      db.query(
        `
        SELECT id FROM payments
        WHERE student_id = ?
          AND status IN ('DUE','PENDING')
        `,
        [id],
        (err2, rows) => {
          if (err2) {
            console.error("Payment check error:", err2);
            return res.status(500).json({ message: "DB error" });
          }

          if (rows.length > 0) {
            return res.json({
              message: "Student approved (payment already exists)",
            });
          }

          // 3️⃣ Get student gender
          db.query(
            "SELECT gender FROM students WHERE id=?",
            [id],
            (err3, studentRows) => {
              if (err3 || studentRows.length === 0) {
                return res.status(500).json({ message: "Student not found" });
              }

              const gender = studentRows[0].gender;

              // 4️⃣ Get CURRENT payment settings (future rule)
              db.query(
                `
                SELECT boys_monthly_amount, girls_monthly_amount
                FROM payment_settings
                WHERE id = 1
                `,
                (err4, settingsRows) => {
                  if (err4) {
                    return res.status(500).json({ message: "DB error" });
                  }

                  const amount =
                    gender === "GIRL"
                      ? settingsRows[0].girls_monthly_amount
                      : settingsRows[0].boys_monthly_amount;

                  // 5️⃣ Create NEW payment cycle (FREEZE amount)
                  const now = new Date();
                  const month = now.toLocaleString("default", {
                    month: "long",
                  });
                  const year = now.getFullYear();

                  db.query(
                    `
                    INSERT INTO payments
                      (student_id, amount, due_amount, payment_month, payment_year, status)
                    VALUES (?, ?, ?, ?, ?, 'DUE')
                    `,
                    [id, amount, amount, month, year],
                    (err5) => {
                      if (err5) {
                        console.error("Create payment error:", err5);
                        return res.status(500).json({ message: "DB error" });
                      }

                      res.json({
                        message:
                          "Student approved and payment cycle started",
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};



/* =========================
   REJECT STUDENT
========================= */
exports.rejectStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE students SET status='REJECTED' WHERE id=?",
    [id],
    (err) => {
      if (err) {
        console.error("Reject student error:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "Student rejected" });
    }
  );
};

/* =========================
   ACTIVE STUDENTS
========================= */
exports.getActiveStudents = (req, res) => {
  db.query(
    `
    SELECT id, name, email, phone, status, created_at
    FROM students
    WHERE status = 'ACTIVE'
    `,
    (err, results) => {
      if (err) {
        console.error("Active students error:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};

/* =========================
   DEACTIVATE STUDENT
========================= */
exports.deactivateStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE students SET status='INACTIVE' WHERE id=?",
    [id],
    (err) => {
      if (err) {
        console.error("Deactivate student error:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "Student deactivated" });
    }
  );
};

/* =========================
   DASHBOARD STATS
========================= */
exports.getDashboardStats = (req, res) => {
  const stats = {};

  db.query(
    "SELECT COUNT(*) AS pending FROM students WHERE status='PENDING'",
    (err, p) => {
      if (err) return res.status(500).json({ message: "DB error" });
      stats.pending = p[0].pending;

      db.query(
        "SELECT COUNT(*) AS active FROM students WHERE status='ACTIVE'",
        (err2, a) => {
          if (err2) return res.status(500).json({ message: "DB error" });
          stats.active = a[0].active;

          db.query(
            "SELECT COUNT(*) AS total FROM students",
            (err3, t) => {
              if (err3) return res.status(500).json({ message: "DB error" });
              stats.total = t[0].total;

              res.json(stats);
            }
          );
        }
      );
    }
  );
};

/* =========================
   PAYMENT SETTINGS
========================= */
exports.getPaymentSettings = (req, res) => {
  db.query(
    "SELECT * FROM payment_settings WHERE id=1",
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows[0]);
    }
  );
};



// update payment setting 
exports.updatePaymentSettings = (req, res) => {
  const {
    upi_id,
    upi_enabled,
    cash_enabled,
    boys_monthly_amount,
    girls_monthly_amount,
  } = req.body;

  const qrImage = req.file ? req.file.filename : null;

  db.query(
    `
    UPDATE payment_settings
    SET
      upi_id = ?,
      upi_enabled = ?,
      cash_enabled = ?,
      boys_monthly_amount = ?,
      girls_monthly_amount = ?,
      qr_image = COALESCE(?, qr_image)
    WHERE id = 1
    `,
    [
      upi_id || null,
      Number(upi_enabled),
      Number(cash_enabled),
      Number(boys_monthly_amount),
      Number(girls_monthly_amount),
      qrImage,
    ],
    (err, result) => {
      if (err) {
        console.error("Payment settings error:", err);
        return res
          .status(500)
          .json({ message: "Failed to save payment settings" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Settings row not found" });
      }

      res.json({ message: "Payment settings updated successfully" });
    }
  );
};


