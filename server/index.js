const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/admin", require("./routes/adminLeave.routes")); // ✅ ADDED
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/payments", require("./routes/payments.routes"));
app.use("/api/mess-settings", require("./routes/messSettings.routes"));
app.use("/api/student", require("./routes/studentLeave.routes"));
app.use("/api/mess-membership", require("./routes/messMembership.routes"));


const authMiddleware = require("./middlewares/auth.middleware");


app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Mess App Backend is running 🚀"
  });
});


app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authorized",
    user: req.user,
  });
});

app.get("/test", (req, res) => {
  res.json({ status: "Backend working" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
