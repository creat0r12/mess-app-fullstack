const db = require("../db");

/* =========================
   GET MESS SETTINGS (ALL)
========================= */
exports.getMessSettings = (req, res) => {
  db.query(
    "SELECT * FROM mess_settings WHERE id = 1",
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "DB error" });
      }
      res.json(rows[0]);
    }
  );
};

/* =========================
   UPDATE MESS SETTINGS (ADMIN)
========================= */
exports.updateMessSettings = (req, res) => {
  const { mess_open, notice, menu } = req.body;
  const image = req.file ? `/uploads/mess/${req.file.filename}` : null;

  db.query(
    `
    UPDATE mess_settings
    SET
      mess_open = ?,
      notice = ?,
      menu = ?,
      image_url = COALESCE(?, image_url)
    WHERE id = 1
    `,
    [mess_open, notice, menu, image],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update settings" });
      }

      res.json({ message: "Mess settings updated successfully" });
    }
  );
};
