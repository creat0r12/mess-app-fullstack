const db = require("../db");



/* =========================
   MARK PAYMENT AS PAID (ADMIN)
========================= */
exports.acceptTransaction = (req, res) => {
  const { transactionId } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    SELECT *
    FROM payment_transactions
    WHERE id = ? AND status = 'PENDING'
    `,
    [transactionId],
    (err, txns) => {
      if (err || !txns.length) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const txn = txns[0];

      db.query(
        `
        SELECT *
        FROM payments
        WHERE membership_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [txn.membership_id],
        (err2, payments) => {
          if (err2 || !payments.length) {
            return res.status(404).json({ message: "Payment cycle not found" });
          }

          const payment = payments[0];
          const newPaid = (payment.paid_amount || 0) + txn.amount;
          const due = Math.max(payment.amount - newPaid, 0);
          const status = newPaid >= payment.amount ? "PAID" : "DUE";


          db.query(
            `
            UPDATE payments
            SET paid_amount = ?, due_amount = ?, status = ?
            WHERE id = ?
            `,
            [newPaid, due, status, payment.id],
            () => {
              db.query(
                `
                UPDATE payment_transactions
                SET status = 'APPLIED',
                    payment_id = ?,
                    admin_id = ?,
                    action_at = NOW()
                WHERE id = ?
                `,
                [payment.id, adminId, txn.id],
                () => res.json({ message: "Payment accepted" })
              );
            }
          );
        }
      );
    }
  );
};



/* =========================
   REJECT PAYMENT (ADMIN)
========================= */
exports.rejectTransaction  = (req, res) => {
  const { transactionId } = req.params;
  const adminId = req.user.id;

  db.query(
    `
    UPDATE payment_transactions
    SET status = 'REJECTED',
        admin_id = ?,
        action_at = NOW()
    WHERE id = ? AND status = 'PENDING'
    `,
    [adminId, transactionId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!result.affectedRows)
        return res.status(404).json({ message: "Transaction not found" });

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
  `
  INSERT INTO payment_transactions
    (membership_id, amount, proof_url, status)
  VALUES
    (?, ?, ?, 'PENDING')
  `,
  [req.user.membership_id, paid_amount, proofUrl],
  (err) => {
    if (err) {
      console.error("SUBMIT PAYMENT ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json({ message: "Payment submitted successfully and pending admin approval" });
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
  const membershipId = req.user.membership_id;

  db.query(
    `
    SELECT
      amount,
      status,
      proof_url,
      submitted_at AS payment_date,
      NULL AS payment_month,
      NULL AS payment_year
    FROM payment_transactions
    WHERE membership_id = ?
    ORDER BY submitted_at DESC
    `,
    [membershipId],
    (err, rows) => {
      if (err) {
        console.error("PAYMENT HISTORY ERROR:", err);
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
  const membershipId = req.user.membership_id;

  // 1️⃣ Get latest payment cycle
  db.query(
    `
    SELECT *
    FROM payments
    WHERE membership_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [membershipId],
    (err, payments) => {
      if (err) {
        console.error("STUDENT PAYMENT ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!payments.length) {
        return res.json(null);
      }

      const payment = payments[0];

      // 2️⃣ Check if there is any pending transaction
      db.query(
        `
        SELECT id
        FROM payment_transactions
        WHERE membership_id = ?
          AND status = 'PENDING'
        ORDER BY submitted_at DESC
        LIMIT 1
        `,
        [membershipId],
        (err2, txns) => {
          if (err2) {
            console.error("PAYMENT TXN ERROR:", err2);
            return res.status(500).json({ message: "DB error" });
          }

          // 🔹 If pending transaction exists → show PENDING in UI
          if (txns.length) {
            payment.status = "PENDING";
          }

          res.json(payment);
        }
      );
    }
  );
};


/* =========================
   ADMIN: STUDENT PAYMENT HISTORY
========================= */
exports.getStudentPaymentHistory = (req, res) => {
  const { membershipId } = req.params;

  db.query(
    `
    SELECT
      t.id,
      t.amount,
      t.status,
      t.proof_url,
      t.submitted_at AS payment_date,
      NULL AS payment_month,
      NULL AS payment_year
    FROM payment_transactions t
    WHERE t.membership_id = ?
    ORDER BY t.submitted_at DESC
    `,
    [membershipId],
    (err, rows) => {
      if (err) {
        console.error("ADMIN PAYMENT HISTORY ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json(rows || []);
    }
  );
};




/* =========================
   STUDENT: CANCEL PENDING PAYMENT
========================= */
exports.cancelPendingPayment = (req, res) => {
  const membershipId = req.user.membership_id;

  db.query(
    `
    UPDATE payment_transactions
    SET status = 'REJECTED'
    WHERE membership_id = ?
      AND status = 'PENDING'
    `,
    [membershipId],
    (err, result) => {
      if (err) {
        console.error("CANCEL PAYMENT ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(400)
          .json({ message: "No pending payment to cancel" });
      }

      res.json({ message: "Pending payment cancelled" });
    }
  );
};




/* =========================
   ADMIN: PENDING PAYMENT TRANSACTIONS
========================= */
exports.getPendingTransactions = (req, res) => {
  db.query(
    `
    SELECT
      t.id AS transaction_id,
      t.amount,
      t.proof_url,
      t.submitted_at,
      m.id AS membership_id,
      u.name AS student_name,
      u.phone
    FROM payment_transactions t
    JOIN student_mess_membership m ON m.id = t.membership_id
    JOIN users u ON u.id = m.user_id
    WHERE t.status = 'PENDING'
    ORDER BY t.submitted_at DESC
    `,
    (err, rows) => {
      if (err) {
        console.error("PENDING TXN ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(rows || []);
    }
  );
};
/* =========================
   ADMIN: ALL PAYMENTS (HISTORY)
========================= */
exports.getAllPayments = (req, res) => {
  db.query(
    `
    SELECT
      p.id,
      p.amount,
      p.paid_amount,
      p.due_amount,
      p.status,
      p.payment_month,
      p.payment_year,
      u.name AS student_name,
      u.phone
    FROM payments p
    JOIN student_mess_membership m ON m.id = p.membership_id
    JOIN users u ON u.id = m.user_id
    ORDER BY p.payment_year DESC, p.id DESC
    `,
    (err, rows) => {
      if (err) {
        console.error("ALL PAYMENTS ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(rows || []);
    }
  );
};


// =========================
// SIMPLE PAYMENT SYSTEM
// =========================

exports.uploadSimplePayment = (req, res) => {
  const { amount, mess_id } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Proof required" });
  }

  // 🔹 Check payment mode
  db.query(
    "SELECT payment_mode FROM messes WHERE id = ?",
    [mess_id],
    (err, rows) => {
      if (err || !rows.length) {
        return res.status(500).json({ message: "Mess not found" });
      }

      const mode = rows[0].payment_mode;

      // ❌ If ADVANCED → block simple payment
      if (mode === "ADVANCED") {
        return res.status(400).json({
          message: "Advanced payment system enabled for this mess",
        });
      }

      const proofUrl = `/uploads/payments/${req.file.filename}`;

      db.query(
        `
        INSERT INTO payments_simple (user_id, mess_id, amount, proof_url)
        VALUES (?, ?, ?, ?)
        `,
        [req.user.id, mess_id, amount || null, proofUrl],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: "DB error" });
          }

          res.json({ message: "Payment submitted" });
        }
      );
    }
  );
};

exports.getSimplePayments = (req, res) => {
  db.query(
    `
    SELECT 
      p.id,
      p.amount,
      p.status,
      p.proof_url,
      p.created_at,
      u.name AS student_name
    FROM payments_simple p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at DESC
    `,
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows);
    }
  );
};


exports.updateSimplePayment = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    `UPDATE payments_simple SET status = ? WHERE id = ?`,
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Updated" });
    }
  );
};

exports.getMySimplePayments = (req, res) => {
  db.query(
    `
    SELECT id, amount, status, proof_url, created_at
    FROM payments_simple
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json(rows);
    }
  );
};


exports.cancelSimplePayment = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    UPDATE payments_simple
    SET status = 'REJECTED'
    WHERE id = ? AND user_id = ? AND status = 'PENDING'
    `,
    [id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (!result.affectedRows) {
        return res.status(400).json({ message: "Cannot cancel" });
      }

      res.json({ message: "Payment cancelled" });
    }
  );
};