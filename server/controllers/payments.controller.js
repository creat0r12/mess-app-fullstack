const db = require("../db");

/* =========================
   GET ALL PAYMENTS (ADMIN)
========================= */
exports.getPayments = (req, res) => {
  const { status } = req.query;

  let sql = `
    SELECT
      p.id,
      p.amount,
      p.due_amount,
      p.paid_amount,
      p.status,
      p.payment_month,
      p.payment_year,
      p.proof_url,
      p.submitted_at,
      p.payment_date,
      u.name AS student_name,
      u.phone
    FROM payments p
    JOIN student_mess_membership m ON m.id = p.membership_id
    JOIN users u ON u.id = m.user_id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    sql += " AND p.status = ?";
    params.push(status);
  }

  sql += " ORDER BY p.payment_year DESC, p.id DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("GET PAYMENTS ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.json(rows);
  });
};

/* =========================
   MARK PAYMENT AS PAID (ADMIN)
========================= */
exports.acceptPayment = (req, res) => {
  const { paymentId } = req.params;

  db.query(
    "SELECT amount, paid_amount FROM payments WHERE id = ?",
    [paymentId],
    (err, rows) => {
      if (err || !rows.length)
        return res.status(404).json({ message: "Payment not found" });

      const total = rows[0].amount;
      const paid = rows[0].paid_amount || 0;
      const due = Math.max(total - paid, 0);

      db.query(
        `
        UPDATE payments
        SET status = 'PAID',
            due_amount = ?,
            payment_date = NOW()
        WHERE id = ?
        `,
        [due, paymentId],
        (err2) => {
          if (err2) return res.status(500).json({ message: "DB error" });
          res.json({ message: "Payment approved" });
        }
      );
    }
  );
};

/* =========================
   REJECT PAYMENT (ADMIN)
========================= */
exports.rejectPayment = (req, res) => {
  const { paymentId } = req.params;

  db.query(
    `
    UPDATE payments
    SET status = 'DUE',
        paid_amount = NULL,
        due_amount = amount,
        proof_url = NULL,
        submitted_at = NULL,
        payment_date = NULL
    WHERE id = ?
    `,
    [paymentId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Payment not found" });

      res.json({ message: "Payment rejected" });
    }
  );
};

/* =========================
   RECENT PAYMENTS (ADMIN)
========================= */
exports.getRecentPayments = (req, res) => {
  db.query(
    `
    SELECT
      p.id,
      u.name AS student_name,
      p.amount,
      p.due_amount,
      p.payment_month,
      p.payment_year,
      p.status,
      p.submitted_at
    FROM payments p
    JOIN student_mess_membership m ON m.id = p.membership_id
    JOIN users u ON u.id = m.user_id
    ORDER BY p.id DESC
    LIMIT 10
    `,
    (err, results) => {
      if (err) {
        console.error("RECENT PAYMENTS ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};

/* =========================
   STUDENT SUBMIT PAYMENT
========================= */
exports.submitPayment = (req, res) => {
  const { paymentId } = req.params;
  const { paid_amount } = req.body;

  if (!paid_amount || paid_amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Payment proof required" });
  }

  const proofUrl = `/uploads/payments/${req.file.filename}`;

  db.query(
    "SELECT amount FROM payments WHERE id = ?",
    [paymentId],
    (err, rows) => {
      if (err || !rows.length)
        return res.status(404).json({ message: "Payment not found" });

      db.query(
        `
        UPDATE payments
        SET paid_amount = ?,
            proof_url = ?,
            submitted_at = NOW(),
            status = 'PENDING'
        WHERE id = ?
        `,
        [paid_amount, proofUrl, paymentId],
        (err2) => {
          if (err2) {
            console.error("SUBMIT PAYMENT ERROR:", err2);
            return res.status(500).json({ message: "DB error" });
          }

          res.json({ message: "Payment submitted successfully" });
        }
      );
    }
  );
};

/* =========================
   TOTAL COLLECTION (ADMIN)
========================= */
exports.getTotalCollection = (req, res) => {
  db.query(
    `
    SELECT COALESCE(SUM(amount),0) AS total
    FROM payments
    WHERE status = 'PAID'
    `,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ total: results[0].total });
    }
  );
};

/* =========================
   STUDENT: OWN PAYMENT HISTORY
========================= */
exports.getMyPaymentHistory = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT
      p.payment_month,
      p.payment_year,
      p.amount,
      p.paid_amount,
      p.due_amount,
      p.status,
      p.payment_date,
      p.proof_url
    FROM payments p
    JOIN student_mess_membership m ON m.id = p.membership_id
    WHERE m.user_id = ?
    ORDER BY p.payment_year DESC, p.payment_month DESC
    `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("MY PAYMENT HISTORY ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(rows || []);
    }
  );
};

/* =========================
   PAYMENT SETTINGS (STUDENT SAFE)
========================= */
exports.getPaymentSettings = (req, res) => {
  db.query(
    "SELECT * FROM payment_settings WHERE id = 1",
    (err, rows) => {
      if (err) {
        console.error("PAYMENT SETTINGS ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      const settings = rows[0];
      if (settings?.qr_image) {
        settings.qr_image = `/uploads/payments/${settings.qr_image}`;
      }

      res.json(settings);
    }
  );
};

/* =========================
   STUDENT CURRENT PAYMENT
========================= */
exports.getStudentCurrentPayment = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT 
      p.*,
      m.gender
    FROM payments p
    JOIN student_mess_membership m ON m.id = p.membership_id
    WHERE m.user_id = ?
    ORDER BY p.payment_year DESC, p.id DESC
    LIMIT 1
    `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("STUDENT PAYMENT ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(rows[0] || null);
    }
  );
};

/* =========================
   ADMIN: STUDENT PAYMENT HISTORY
========================= */
exports.getStudentPaymentHistory = (req, res) => {
  const { studentId } = req.params;

  db.query(
    `
    SELECT
      p.payment_month,
      p.payment_year,
      p.amount,
      p.paid_amount,
      p.due_amount,
      p.status,
      p.payment_date,
      p.proof_url
    FROM payments p
    JOIN student_mess_membership m ON m.id = p.membership_id
    WHERE m.user_id = ?
    ORDER BY p.payment_year DESC, p.payment_month DESC
    `,
    [studentId],
    (err, rows) => {
      if (err) {
        console.error("ADMIN PAYMENT HISTORY ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(rows || []);
    }
  );
};
