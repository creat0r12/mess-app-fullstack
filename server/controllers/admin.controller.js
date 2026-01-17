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

  // 1️⃣ Get student (joining date + gender + status)
  db.query(
    "SELECT id, created_at, gender, status FROM students WHERE id = ?",
    [id],
    (err, students) => {
      if (err) {
        console.error("Get student error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (students.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = students[0];

      // 🔒 Prevent duplicate approval
      if (student.status === "ACTIVE") {
        return res.status(400).json({
          message: "Student is already approved",
        });
      }

      // 2️⃣ Activate student
      db.query(
        "UPDATE students SET status='ACTIVE' WHERE id=?",
        [id],
        (err2) => {
          if (err2) {
            console.error("Approve error:", err2);
            return res.status(500).json({ message: "DB error" });
          }

          // 3️⃣ Calculate cycle dates
          const startDate = new Date(student.created_at);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 30);

          // 4️⃣ Create student cycle
          db.query(
            `
            INSERT INTO student_cycles
            (student_id, cycle_start_date, cycle_end_date)
            VALUES (?, ?, ?)
            `,
            [
              student.id,
              startDate.toISOString().slice(0, 10),
              endDate.toISOString().slice(0, 10),
            ],
            (err3, cycleResult) => {
              if (err3) {
                console.error("Cycle creation error:", err3);
                return res
                  .status(500)
                  .json({ message: "Cycle creation failed" });
              }

              const cycleId = cycleResult.insertId;

              // 5️⃣ Get amount from payment_settings
              db.query(
                `
                SELECT boys_monthly_amount, girls_monthly_amount
                FROM payment_settings
                WHERE id = 1
                `,
                (err4, settings) => {
                  if (err4) {
                    console.error("Payment settings error:", err4);
                    return res.status(500).json({ message: "DB error" });
                  }

                  const amount =
                    student.gender === "FEMALE"
                      ? settings[0].girls_monthly_amount
                      : settings[0].boys_monthly_amount;

                  const monthName = startDate.toLocaleString("default", {
                    month: "long",
                  });
                  const year = startDate.getFullYear();

                  // 6️⃣ Create payment (linked to student_cycles)
                  db.query(
                    `
                    INSERT INTO payments
                    (
                      student_id,
                      cycle_id,
                      amount,
                      due_amount,
                      paid_amount,
                      payment_month,
                      payment_year,
                      status
                    )
                    VALUES (?, ?, ?, ?, 0, ?, ?, 'DUE')
                    `,
                    [
                      student.id,
                      cycleId,
                      amount,
                      amount,
                      monthName,
                      year,
                    ],
                    (err5) => {
                      if (err5) {
                        console.error("Payment creation error:", err5);

                        // 🛡️ Safety: close the cycle if payment fails
                        db.query(
                          "UPDATE student_cycles SET status='COMPLETED' WHERE id=?",
                          [cycleId]
                        );

                        return res.status(500).json({
                          message:
                            "Student approved but payment creation failed",
                        });
                      }

                      res.json({
                        message:
                          "Student approved, personal cycle & payment created",
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


