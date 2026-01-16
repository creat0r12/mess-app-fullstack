const db = require("../db");

/* =========================
   GET ALL PAYMENTS (ADMIN)
========================= */
exports.getPayments = (req, res) => {
  const { status, student_id } = req.query;

  let sql = `
    SELECT
      p.id,
      p.student_id,
      p.amount,
      p.due_amount,
      p.paid_amount,
      p.status,
      p.payment_month,
      p.payment_year,
      p.proof_url,
      p.submitted_at,
      p.payment_date,
      s.name AS student_name,
      s.phone
    FROM payments p
    JOIN students s ON s.id = p.student_id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    sql += " AND p.status = ?";
    params.push(status);
  }

  if (student_id) {
    sql += " AND p.student_id = ?";
    params.push(student_id);
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
      s.name AS student_name,
      p.amount,
      p.due_amount,
      p.payment_month,
      p.payment_year,
      p.status,
      p.submitted_at
    FROM payments p
    JOIN students s ON p.student_id = s.id
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
   STUDENT PAYMENT HISTORY
========================= */
exports.getStudentPaymentHistory = (req, res) => {
  const { studentId } = req.params;

  db.query(
    `
    SELECT
      payment_month,
      payment_year,
      amount,
      payment_date,
      proof_url
    FROM payments
    WHERE student_id = ?
      AND status = 'PAID'
      AND payment_date IS NOT NULL
    ORDER BY payment_year DESC, payment_date DESC
    `,
    [studentId],
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
      if (settings.qr_image) {
        settings.qr_image = `/uploads/payments/${settings.qr_image}`;
      }

      res.json(settings);
    }
  );
};

/* =========================
   STUDENT CURRENT PAYMENT (FIXED)
========================= */
exports.getStudentCurrentPayment = (req, res) => {
  const studentId = req.user.id;

  // 1️⃣ Get latest payment + student gender
  db.query(
    `
    SELECT 
      p.*,
      s.gender
    FROM payments p
    JOIN students s ON s.id = p.student_id
    WHERE p.student_id = ?
    ORDER BY p.payment_year DESC, p.id DESC
    LIMIT 1
    `,
    [studentId],
    (err, rows) => {
      if (err) {
        console.error("STUDENT PAYMENT ERROR:", err);
        return res.status(500).json({ message: "DB error" });
      }

      const currentPayment = rows[0];
      if (!currentPayment) return res.json(null);

      // 2️⃣ Get gender-based prices from payment_settings
      db.query(
        `
        SELECT boys_monthly_amount, girls_monthly_amount
        FROM payment_settings
        WHERE id = 1
        `,
        (err2, settingsRows) => {
          if (err2 || !settingsRows.length) {
            console.error("PAYMENT SETTINGS ERROR:", err2);
            return res.status(500).json({ message: "Payment settings missing" });
          }

          const settings = settingsRows[0];

          // 3️⃣ Decide monthly amount based on gender
          const monthlyAmount =
            currentPayment.gender === "FEMALE"
              ? settings.girls_monthly_amount
              : settings.boys_monthly_amount;

          // 4️⃣ Check for previous unpaid months
          db.query(
            `
            SELECT COUNT(*) AS due_count
            FROM payments
            WHERE student_id = ?
              AND (
                payment_year < ?
                OR (payment_year = ? AND payment_month != ?)
              )
              AND status != 'PAID'
            `,
            [
              studentId,
              currentPayment.payment_year,
              currentPayment.payment_year,
              currentPayment.payment_month,
            ],
            (err3, rows3) => {
              if (err3) {
                console.error("PREVIOUS DUE CHECK ERROR:", err3);
                return res.status(500).json({ message: "DB error" });
              }

              res.json({
                ...currentPayment,
                amount: monthlyAmount, // ✅ gender-based amount
                due_amount:
                  monthlyAmount - (currentPayment.paid_amount || 0),
                has_previous_due: rows3[0].due_count > 0, // ✅ last month due flag
              });
            }
          );
        }
      );
    }
  );
};

