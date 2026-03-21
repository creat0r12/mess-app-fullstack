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
    "SELECT id, password, role FROM users WHERE phone = ? AND role = 'STUDENT'",
    [phone],
    (err, users) => {
      if (err) {
        console.error("VERIFY ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (users.length === 0) {
        return res.status(404).json({
          message: "Account not found. Please contact mess admin.",
        });
      }

      res.json({
        success: true,
        passwordSet: !!users[0].password,
      });
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
    "SELECT id, password FROM users WHERE phone = ? AND role = 'STUDENT'",
    [phone],
    async (err, users) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (users.length === 0) {
        return res.status(404).json({ message: "Account not found" });
      }

      if (users[0].password) {
        return res.status(400).json({
          message: "Password already set. Please login.",
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashed, users[0].id],
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
    "SELECT id, name, phone, password FROM users WHERE phone = ? AND role = 'STUDENT'",
    [phone],
    async (err, users) => {
      if (err) {
        console.error("STUDENT LOGIN ERROR:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (users.length === 0) {
        return res.status(404).json({ message: "Account not found" });
      }

      if (!users[0].password) {
        return res.status(403).json({
          message: "Password not set",
        });
      }

      const isMatch = await bcrypt.compare(password, users[0].password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      const token = jwt.sign(
        {
          id: users[0].id,
          role: "STUDENT",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        student: {
          id: users[0].id,
          name: users[0].name,
          phone: users[0].phone,
        },
      });
    }
  );
};



// request mess join

exports.requestMessJoin = (req, res) => {
  const { name, phone, email, mess_id, meal_slot, gender } = req.body;

  /* =========================
     BASIC VALIDATIONS
  ========================= */
  if (!name || !phone || !mess_id || !meal_slot || !gender) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (!["MALE", "FEMALE", "OTHER"].includes(gender)) {
    return res.status(400).json({ message: "Invalid gender" });
  }

  if (!["LUNCH", "DINNER", "BOTH"].includes(meal_slot)) {
    return res.status(400).json({ message: "Invalid meal slot" });
  }

  /* =========================
     CHECK / CREATE USER
  ========================= */
  db.query(
    "SELECT id FROM users WHERE phone = ?",
    [phone],
    (err, users) => {
      if (err) {
        console.error("User lookup error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      const createMemberships = (userId) => {
        /* =========================
           HANDLE BOTH → LUNCH + DINNER
        ========================= */
        const slots =
          meal_slot === "BOTH" ? ["LUNCH", "DINNER"] : [meal_slot];

        const values = slots.map(slot => [
          userId,
          mess_id,
          slot,
          gender,
          "PENDING",
        ]);

        db.query(
          `
  INSERT IGNORE INTO student_mess_membership
    (user_id, mess_id, meal_slot, gender, status)
  VALUES ?
  `,
          [values],
          (err2, result) => {
            if (err2) {
              console.error("Membership error:", err2);
              return res.status(500).json({
                message: "Membership insert failed",
              });
            }

            // 🔥 IMPORTANT ADD THIS
            if (result.affectedRows === 0) {
              return res.status(400).json({
                message: "You already requested these meal slots",
              });
            }

            res.json({
              message: "Mess join request submitted successfully",
            });
          }
        );
      };

      /* =========================
         NEW USER
      ========================= */
      if (users.length === 0) {
        db.query(
          `
          INSERT INTO users (name, phone, email, role)
          VALUES (?, ?, ?, 'STUDENT')
          `,
          [name, phone, email || null],
          (err3, result) => {
            if (err3) {
              console.error("Create user error:", err3);
              return res.status(500).json({ message: "DB error" });
            }

            createMemberships(result.insertId);
          }
        );
      }
      /* =========================
         EXISTING USER
      ========================= */
      else {
        createMemberships(users[0].id);
      }
    }
  );
};



