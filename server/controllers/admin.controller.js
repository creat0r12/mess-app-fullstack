const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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




/* =========================
   CREATE MESS REQUEST
   + CREATE MESS ADMIN USER
========================= */
exports.createMessRequest = async (req, res) => {
  const { name, phone, email, address, description, password } = req.body;

  if (!name || !phone || !address || !description || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // 1️⃣ Check if admin already exists (by phone or email)
    db.query(
      `SELECT id FROM users WHERE phone = ? OR email = ?`,
      [phone, email],
      async (err, existing) => {
        if (err) {
          console.error("User check error:", err);
          return res.status(500).json({ message: "DB error" });
        }

        if (existing.length > 0) {
          return res
            .status(400)
            .json({ message: "Admin already exists with this phone/email" });
        }

        // 2️⃣ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3️⃣ Create MESS_ADMIN user
        db.query(
          `
          INSERT INTO users
            (name, phone, email, password, role)
          VALUES
            (?, ?, ?, ?, 'MESS_ADMIN')
          `,
          [name, phone, email || null, hashedPassword],
          (err2, userResult) => {
            if (err2) {
              console.error("Create admin user error:", err2);
              return res.status(500).json({ message: "Failed to create admin" });
            }

            const ownerUserId = userResult.insertId;

            // 4️⃣ Create mess and link admin
            db.query(
              `
              INSERT INTO messes
                (name, phone, email, address, description, status, owner_user_id)
              VALUES
                (?, ?, ?, ?, ?, 'PENDING_VERIFICATION', ?)
              `,
              [name, phone, email || null, address, description, ownerUserId],
              (err3, messResult) => {
                if (err3) {
                  console.error("Create mess error:", err3);
                  return res
                    .status(500)
                    .json({ message: "Failed to create mess" });
                }

                res.json({
                  message: "Mess request submitted successfully",
                  mess_id: messResult.insertId,
                  status: "PENDING_VERIFICATION",
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error("Create mess request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




/* =========================
   PLATFORM ADMIN LOGIN
========================= */
exports.platformAdminLogin = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM platform_admins WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Platform admin login DB error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const admin = results[0];

      if (admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          platformAdminId: admin.id,
          role: "PLATFORM_ADMIN",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token });
    }
  );
};


/* =========================
   GET ALL MESS REQUESTS
   (PLATFORM ADMIN ONLY)
========================= */
exports.getMessRequests = (req, res) => {
  // 🔒 HARD SECURITY CHECK
  if (!req.user || req.user.role !== "PLATFORM_ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }

  db.query(
    "SELECT * FROM messes ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(results);
    }
  );
};

/* =========================
   APPROVE MESS REQUEST
========================= */
exports.approveMessRequest = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM messes WHERE id = ? AND status = 'PENDING_VERIFICATION'",
    [id],
    (err, messes) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (messes.length === 0)
        return res.status(404).json({ message: "Mess not found" });

      // ✅ Only activate mess
      db.query(
        `
        UPDATE messes
        SET status='ACTIVE'
        WHERE id=?
        `,
        [id],
        (err2) => {
          if (err2)
            return res.status(500).json({ message: "Mess activation failed" });

          res.json({ message: "Mess approved successfully" });
        }
      );
    }
  );
};




/* =========================
   REJECT MESS REQUEST
========================= */
exports.rejectMessRequest = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    UPDATE messes
    SET status = 'REJECTED'
    WHERE id = ?
    `,
    [id],
    (err, result) => {
      if (err) {
        console.error("Reject mess error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Mess not found" });
      }

      res.json({ message: "Mess rejected successfully" });
    }
  );
};

/* =========================
   GET ACTIVE MESSES (PUBLIC)
========================= */
exports.getActiveMesses = (req, res) => {
  db.query(
    `
    SELECT id, name, phone, email, address, description
    FROM messes
    WHERE status = 'ACTIVE'
    ORDER BY created_at DESC
    `,
    (err, results) => {
      if (err) {
        console.error("Get active messes error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(results);
    }
  );
};
