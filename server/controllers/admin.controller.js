const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/* =========================
   PENDING STUDENTS
========================= */
exports.getPendingStudents = (req, res) => {
  const messId = req.user.mess_id;

  if (!messId) {
    return res.status(403).json({ message: "Mess not linked to admin" });
  }

  const sql = `
    SELECT
      smm.id AS membership_id,
      u.id AS user_id,
      u.name,
      u.phone,
      u.email,
      smm.meal_slot,
      smm.status,
      smm.created_at
    FROM student_mess_membership smm
    JOIN users u ON u.id = smm.user_id
    WHERE smm.status = 'PENDING'
      AND smm.mess_id = ?
    ORDER BY smm.created_at DESC
  `;

  db.query(sql, [messId], (err, results) => {
    if (err) {
      console.error("Pending memberships error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json(results);
  });
};


/* =========================
   APPROVE STUDENT
========================= */
exports.approveStudent = (req, res) => {
  const membershipId = req.params.id;
  const messId = req.user.mess_id;

  if (!messId) {
    return res.status(403).json({ message: "Mess not linked to admin" });
  }

  // 1️⃣ Get membership + user gender
  const getSql = `
  SELECT 
    smm.id AS membership_id,
    smm.user_id,
    smm.mess_id,
    smm.gender
  FROM student_mess_membership smm
  WHERE smm.id = ?
    AND smm.mess_id = ?
    AND smm.status = 'PENDING'
`;


  db.query(getSql, [membershipId, messId], (err, rows) => {
    if (err) {
      console.error("Membership fetch error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Pending request not found for this mess",
      });
    }

    const { user_id, gender } = rows[0];

    // ✅ Ensure user exists (GLOBAL IDENTITY)
db.query(
  "SELECT id FROM users WHERE id = ?",
  [user_id],
  (errU, users) => {
    if (errU) {
      console.error("User check error:", errU);
      return res.status(500).json({ message: "User check failed" });
    }

    // If user does not exist, create minimal user
    if (users.length === 0) {
      db.query(
        `
        INSERT INTO users (id, role)
        VALUES (?, 'STUDENT')
        `,
        [user_id],
        (errCreate) => {
          if (errCreate) {
            console.error("User creation error:", errCreate);
            return res.status(500).json({ message: "User creation failed" });
          }
        }
      );
    }
  }
);


    // 2️⃣ Approve membership
    db.query(
      `
      UPDATE student_mess_membership
      SET status = 'ACTIVE'
      WHERE id = ?
      `,
      [membershipId],
      (err2) => {
        if (err2) {
          console.error("Approve membership error:", err2);
          return res.status(500).json({ message: "DB error" });
        }

        // 3️⃣ Fetch payment settings
        db.query(
          `
          SELECT boys_monthly_amount, girls_monthly_amount
          FROM payment_settings
          WHERE id = 1
          `,
          (err3, settings) => {
            if (err3 || settings.length === 0) {
              console.error("Payment settings error:", err3);
              return res.status(500).json({ message: "Payment config error" });
            }

            // ✅ Gender-based pricing (business rule preserved)
            const amount =
              gender === "FEMALE"
                ? settings[0].girls_monthly_amount
                : settings[0].boys_monthly_amount;

            // 4️⃣ Create first payment (MESS + MEMBERSHIP SCOPED)
            const now = new Date();
            const month = now.toLocaleString("default", { month: "long" });
            const year = now.getFullYear();

            db.query(
              `
  INSERT INTO payments
  (
    mess_id,
    membership_id,
    amount,
    paid_amount,
    due_amount,
    payment_month,
    payment_year,
    status
  )
  VALUES (?, ?, ?, 0, ?, ?, ?, 'DUE')
  `,
              [
                messId,
                membershipId,
                amount,
                amount,
                month,
                year,
              ],
              (err4) => {
                if (err4) {
                  console.error("Payment creation error:", err4);
                  return res.status(500).json({
                    message: "Membership approved but payment creation failed",
                  });
                }

                res.json({
                  message: "Student approved and payment cycle created",
                });
              }
            );

          }
        );
      }
    );
  });
};








/* =========================
   REJECT STUDENT
========================= */
exports.rejectStudent = (req, res) => {
  const { id } = req.params; // membership_id
  const messId = req.user.mess_id;

  const sql = `
    UPDATE student_mess_membership
    SET status = 'REJECTED'
    WHERE id = ?
      AND mess_id = ?
      AND status = 'PENDING'
  `;

  db.query(sql, [id, messId], (err, result) => {
    if (err) {
      console.error("Reject membership error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Request not found or already processed",
      });
    }

    res.json({ message: "Student request rejected" });
  });
};


/* =========================
   ACTIVE STUDENTS
========================= */
exports.getActiveStudents = (req, res) => {
  const messId = req.user.mess_id;

  if (!messId) {
    return res.status(403).json({ message: "Mess not linked to admin" });
  }

  db.query(
    `
    SELECT DISTINCT
      u.id AS user_id,
      u.name,
      u.phone,
      u.email,
      smm.meal_slot,
      smm.created_at
    FROM student_mess_membership smm
    JOIN users u ON u.id = smm.user_id
    WHERE smm.status = 'ACTIVE'
      AND smm.mess_id = ?
    ORDER BY smm.created_at DESC
    `,
    [messId],
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
