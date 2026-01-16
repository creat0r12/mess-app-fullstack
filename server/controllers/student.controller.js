const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getAllStudents = (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

/* =========================
   STUDENT REQUEST (FINAL)
========================= */
exports.requestStudent = (req, res) => {
  const { name, phone, gender, email } = req.body;

  // 1️⃣ VALIDATIONS
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    return res.status(400).json({
      message: "Name can contain only letters",
    });
  }

  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({
      message: "Phone number must be exactly 10 digits",
    });
  }

  if (!gender || !["MALE", "FEMALE", "OTHER"].includes(gender)) {
    return res.status(400).json({
      message: "Gender is required",
    });
  }

  // 2️⃣ CHECK DUPLICATE PHONE / EMAIL
  const checkSql = `
  SELECT id, status 
  FROM students 
  WHERE phone = ?
  ${email ? "OR email = ?" : ""}
  LIMIT 1
`;

  const params = email ? [phone, email] : [phone];


  db.query(checkSql, [phone, email || null], (err, existing) => {
    if (err) {
      console.error("CHECK STUDENT ERROR:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Phone or email already registered",
      });
    }

    // 3️⃣ INSERT REQUEST (NO PASSWORD)
    const insertSql = `
      INSERT INTO students
      (name, phone, gender, email, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `;

    db.query(
      insertSql,
      [name.trim(), phone, gender, email || null],
      (err2) => {
        if (err2) {
          console.error("INSERT STUDENT ERROR:", err2);
          return res
            .status(500)
            .json({ message: "Failed to submit request" });
        }

        res.json({
          message:
            "Request submitted successfully. Please wait for admin approval.",
        });
      }
    );
  });
};

/* =========================
   VERIFY STUDENT PHONE
========================= */
exports.verifyStudent = (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone required" });
  }

  db.query(
    "SELECT id, status FROM students WHERE phone = ?",
    [phone],
    (err, results) => {
      if (err) {
        console.error("VERIFY ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = results[0];

      if (student.status !== "ACTIVE") {
        return res.status(403).json({ message: "Student not approved yet" });
      }

      // ✅ VERIFIED
      db.query(
        "SELECT password FROM students WHERE phone = ?",
        [phone],
        (err2, rows) => {
          if (err2) return res.status(500).json({ message: "Server error" });

          const passwordSet = !!rows[0].password;

          res.json({
            success: true,
            passwordSet
          });
        }
      );

    }
  );
};




/* =========================
   SET STUDENT PASSWORD (FIRST TIME)
========================= */
exports.setStudentPassword = async (req, res) => {
  const { phone, password, confirmPassword } = req.body;

  if (!phone || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  db.query(
    "SELECT id, password FROM students WHERE phone = ? AND status='ACTIVE'",
    [phone],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (results[0].password) {
        return res.status(400).json({
          message: "Password already set. Please login."
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE students SET password = ? WHERE phone = ?",
        [hashed, phone],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: "Failed to set password" });
          }

          res.json({ success: true });
        }
      );
    }
  );
};


/* =========================
   STUDENT LOGIN
========================= */
exports.loginStudent = (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password required" });
  }

  db.query(
    "SELECT id, name, phone, password, status FROM students WHERE phone = ?",
    [phone],
    async (err, results) => {
      if (err) {
        console.error("STUDENT LOGIN ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = results[0];

      if (student.status !== "ACTIVE") {
        return res.status(403).json({ message: "Student not approved yet" });
      }

      if (!student.password) {
        return res.status(403).json({
          message: "Password not set. Please contact admin.",
        });
      }

      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // ✅ CREATE JWT TOKEN
      const token = jwt.sign(
        {
          id: student.id,
          role: "STUDENT",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ SEND TOKEN + STUDENT
      res.json({
        success: true,
        token,
        student: {
          id: student.id,
          name: student.name,
          phone: student.phone,
          status: student.status,
        },
      });
    }
  );
};



/* =========================
   GET PENDING STUDENTS (ADMIN)
========================= */
exports.getPendingStudents = (req, res) => {
  db.query(
    "SELECT * FROM students WHERE status = 'PENDING'",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};

/* =========================
   APPROVE STUDENT (ADMIN)
========================= */
exports.approveStudent = (req, res) => {
  const { id } = req.params;

  // 1️⃣ Get student
  db.query(
    "SELECT id, gender FROM students WHERE id = ?",
    [id],
    (err, students) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (students.length === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      const student = students[0];

      // 2️⃣ Approve student
      db.query(
        "UPDATE students SET status='ACTIVE' WHERE id=?",
        [id],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ message: "DB error" });
          }

          // 3️⃣ Create mess cycle
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(startDate.getDate() + 30);

          let baseAmount = 2500;
          if (student.gender === "FEMALE") {
            baseAmount = 2300;
          }

          db.query(
            `
            INSERT INTO mess_cycles
            (student_id, cycle_start_date, cycle_end_date, base_amount, gender, free_absence_limit)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              student.id,
              startDate,
              endDate,
              baseAmount,
              student.gender,
              5
            ],
            (err3, cycleResult) => {
              if (err3) {
                console.error(err3);
                return res.status(500).json({ message: "Cycle creation failed" });
              }

              const cycleId = cycleResult.insertId;

              // 4️⃣ CREATE INITIAL PAYMENT (DUE)
              db.query(
                `
                INSERT INTO payments
                (student_id, amount, due_amount, payment_month, payment_year, status, cycle_id)
                VALUES (?, ?, ?, ?, ?, 'DUE', ?)
                `,
                [
                  student.id,
                  baseAmount,
                  baseAmount,
                  startDate.toLocaleString("default", { month: "long" }),
                  startDate.getFullYear(),
                  cycleId
                ],
                (err4) => {
                  if (err4) {
                    console.error(err4);
                    return res.status(500).json({
                      message: "Student approved but payment creation failed",
                    });
                  }

                  res.json({
                    message: "Student approved, cycle & payment created",
                  });
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
   REJECT STUDENT (ADMIN)
========================= */
exports.rejectStudent = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE students SET status='INACTIVE' WHERE id=?",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student rejected" });
    }
  );
};

/* =========================
   GET ACTIVE STUDENTS (ADMIN)
========================= */
exports.getActiveStudents = (req, res) => {
  db.query(
    "SELECT * FROM students WHERE status = 'ACTIVE'",
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(results);
    }
  );
};
