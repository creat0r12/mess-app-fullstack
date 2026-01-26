const jwt = require("jsonwebtoken");

/* =========================
   BASE AUTH (JWT VERIFY)
========================= */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, mess_id }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* =========================
   ADMIN AUTH (ADMIN + MESS_ADMIN)
========================= */
const adminAuth = (req, res, next) => {
  authenticate(req, res, () => {
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "MESS_ADMIN"
    ) {
      return res.status(403).json({ message: "Admin access only" });
    }
    next();
  });
};

/* =========================
   STUDENT AUTH
========================= */
const studentAuth = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Student access only" });
    }
    next();
  });
};

module.exports = {
  authenticate,
  adminAuth,
  studentAuth,
};
