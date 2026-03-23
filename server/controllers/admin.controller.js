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

  const sql = `
    SELECT 
      u.id AS id,
      u.name,
      u.phone,
      u.email,
      GROUP_CONCAT(smm.meal_slot ORDER BY smm.meal_slot SEPARATOR ' + ') AS meal_slots,
      MIN(smm.joined_at) AS joined_at
    FROM student_mess_membership smm
    JOIN users u ON u.id = smm.user_id
    WHERE smm.status = 'ACTIVE'
      AND smm.mess_id = ?
    GROUP BY u.id, u.name, u.phone, u.email
    ORDER BY joined_at DESC
  `;

  db.query(sql, [messId], (err, results) => {
    if (err) {
      console.error("Active students error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json(results);
  });
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
  const messId = req.user.mess_id;

  if (!messId) {
    return res.status(403).json({ message: "Mess not linked to admin" });
  }

  db.query(
    `
  SELECT 
    user_id,
    MAX(
      CASE 
        WHEN status = 'PENDING' THEN 2
        WHEN status = 'ACTIVE' THEN 1
        ELSE 0
      END
    ) AS priority
  FROM student_mess_membership
  WHERE mess_id = ?
    AND status IN ('PENDING', 'ACTIVE')   -- 🔥 FIX
  GROUP BY user_id
  `,
    [messId],
    (err, rows) => {
      if (err) {
        console.error("Dashboard stats error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      let pending = 0;
      let active = 0;

      rows.forEach((r) => {
        if (r.priority === 2) pending++;
        else if (r.priority === 1) active++;
      });

      const stats = {
        pending,
        active,
        total: rows.length,
      };

      res.json(stats);
    }
  );
};


/* =========================
   PAYMENT SETTINGS
========================= */
exports.getPaymentSettings = (req, res) => {
  const messId = req.user.mess_id; // ✅ IMPORTANT

  db.query(
    "SELECT * FROM payment_settings WHERE mess_id = ?",
    [messId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });

      // If no row → return empty defaults
      if (!rows || rows.length === 0) {
        return res.json({
          upi_enabled: 0,
          cash_enabled: 0,
          upi_id: null,
          qr_image: null,
          boys_one_time: 0,
          boys_two_time: 0,
          girls_one_time: 0,
          girls_two_time: 0,
        });
      }

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
    boys_one_time,
    boys_two_time,
    girls_one_time,
    girls_two_time,
  } = req.body;

  const messId = req.user.mess_id;
  const qrImage = req.file ? req.file.filename : null;

  // ✅ SAFE NUMBER FUNCTION (VERY IMPORTANT)
  const safeNumber = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // 🔥 Ensure row exists
  db.query(
    "SELECT id FROM payment_settings WHERE mess_id = ?",
    [messId],
    (err, rows) => {
      if (err) {
        console.error("Check error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (rows.length === 0) {
        db.query(
          "INSERT INTO payment_settings (mess_id) VALUES (?)",
          [messId],
          (err2) => {
            if (err2) {
              console.error("Insert error:", err2);
              return res.status(500).json({ message: "Insert failed" });
            }
            updateSettings();
          }
        );
      } else {
        updateSettings();
      }
    }
  );

  function updateSettings() {
    db.query(
      `
      UPDATE payment_settings
      SET
        upi_id = ?,
        upi_enabled = ?,
        cash_enabled = ?,
        boys_one_time = ?,
        boys_two_time = ?,
        girls_one_time = ?,
        girls_two_time = ?,
        qr_image = COALESCE(?, qr_image)
      WHERE mess_id = ?
      `,
      [
        upi_id || null,
        Number(upi_enabled) || 0,
        Number(cash_enabled) || 0,
        safeNumber(boys_one_time),   // ✅ FIXED
        safeNumber(boys_two_time),   // ✅ FIXED
        safeNumber(girls_one_time),  // ✅ FIXED
        safeNumber(girls_two_time),  // ✅ FIXED
        qrImage,
        messId,
      ],
      (err) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({
            message: "Failed to save payment settings",
          });
        }

        res.json({ message: "Payment settings updated successfully" });
      }
    );
  }
};



/* =========================
   CREATE MESS REQUEST
   + CREATE MESS ADMIN USER
========================= */
exports.createMessRequest = async (req, res) => {
  const {
    owner_name,   // ✅ ADD THIS
    name,         // mess name
    phone,
    email,
    address,
    description,
    password
  } = req.body;

  if (!owner_name || !name || !phone || !address || !description || !password) {
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
          [owner_name, phone, email || null, hashedPassword],
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

  console.log("LOGIN TRY:", email, password);

  db.query(
    `
    SELECT * FROM users
    WHERE email = ?
      AND role = 'PLATFORM_ADMIN'
      AND status = 'ACTIVE'
    `,
    [email],
    async (err, results) => {
      console.log("DB RESULTS:", results);

      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (results.length === 0) {
        console.log("❌ NO USER FOUND");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const admin = results[0];

      const isMatch = await bcrypt.compare(password, admin.password);
      console.log("PASSWORD MATCH:", isMatch);

      if (!isMatch) {
        console.log("❌ PASSWORD MISMATCH");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: admin.id, role: "PLATFORM_ADMIN" },
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
    SELECT 
      m.id,
      m.name,
      m.phone,
      m.email,
      m.address,
      m.description,
      u.name AS owner_name,

      
      ps.boys_one_time,
      ps.boys_two_time,
      ps.girls_one_time,
      ps.girls_two_time

    FROM messes m

    JOIN users u 
      ON m.owner_user_id = u.id

    LEFT JOIN payment_settings ps 
      ON ps.mess_id = m.id   -- ✅ VERY IMPORTANT

    WHERE m.status = 'ACTIVE'

    ORDER BY m.created_at DESC
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
