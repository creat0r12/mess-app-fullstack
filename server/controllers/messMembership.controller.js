const db = require("../db");

/**
 * Student requests to join a mess (meal-wise)
 */
exports.requestJoinMess = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { mess_id, meal_slot } = req.body;

    if (!mess_id || !meal_slot) {
      return res.status(400).json({ message: "Mess and meal slot required" });
    }

    // check existing slot usage
    const [existing] = await db.query(
      `SELECT * FROM student_mess_membership 
       WHERE user_id = ? AND meal_slot = ? AND status IN ('PENDING','ACTIVE')`,
      [userId, meal_slot]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "You already have a mess for this meal slot",
      });
    }

    await db.query(
      `INSERT INTO student_mess_membership (user_id, mess_id, meal_slot)
       VALUES (?, ?, ?)`,
      [userId, mess_id, meal_slot]
    );

    res.json({ message: "Mess join request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Student leaves a mess
 */
exports.leaveMess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { meal_slot } = req.body;

    await db.query(
      `UPDATE student_mess_membership
       SET status='LEFT', left_at=NOW()
       WHERE user_id=? AND meal_slot=? AND status='ACTIVE'`,
      [userId, meal_slot]
    );

    res.json({ message: "Left mess successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
