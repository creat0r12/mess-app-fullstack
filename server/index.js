const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const app = express();

/* =========================
   GLOBAL MIDDLEWARES
========================= */

// ✅ FINAL CORS FIX (PRODUCTION READY)
const allowedOrigins = [
  "http://localhost:5173",
  "https://mess-app-fullstack-1.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests without origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// ✅ IMPORTANT: handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* =========================
   ROUTES
========================= */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/admin", require("./routes/adminLeave.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/payments", require("./routes/payments.routes"));
app.use("/api/mess-settings", require("./routes/messSettings.routes"));
app.use("/api/student", require("./routes/studentLeave.routes"));
app.use("/api/mess-membership", require("./routes/messMembership.routes"));

/* =========================
   HEALTH / TEST ROUTES
========================= */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Mess App Backend is running 🚀",
  });
});

app.get("/test", (req, res) => {
  res.json({ status: "Backend working" });
});

/* =========================
   AUTH TEST ROUTE
========================= */
const { authenticate } = require("./middlewares/auth.middleware");

app.get("/api/protected", authenticate, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});