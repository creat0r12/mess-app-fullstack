const db = require("../db");

/* =========================
   GET MESS SETTINGS (ALL)
========================= */
exports.getMessSettings = (req, res) => {

  db.query(
    "SELECT * FROM mess_settings LIMIT 1",
    (err, rows) => {

      if (err) {
        console.error("Fetch error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!rows || rows.length === 0) {

        db.query(
          "INSERT INTO mess_settings (id, mess_open, notice, menu, image_url) VALUES (1,0,'','',NULL)",
          (insertErr) => {

            if (insertErr) {
              console.error("Insert error:", insertErr);
              return res.status(500).json({ message: "Insert failed" });
            }

            db.query(
              "SELECT * FROM mess_settings LIMIT 1",
              (err2, rows2) => {

                if (err2) {
                  console.error("Fetch error:", err2);
                  return res.status(500).json({ message: "Database error" });
                }

                res.json(rows2[0]);

              }
            );

          }
        );

      } else {

        res.json(rows[0]);

      }

    }
  );

};

/* =========================
   UPDATE MESS SETTINGS (ADMIN)
========================= */
exports.updateMessSettings = (req, res) => {
  const removeImage = req.body.remove_image === "1";
  const { mess_open, notice, menu } = req.body;

  let image_url = null;

  if (req.file) {
    image_url = `/uploads/mess/${req.file.filename}`;
  }

  const query = `
    UPDATE mess_settings
    SET
      mess_open = ?,
      notice = ?,
      menu = ?,
      image_url = CASE 
       WHEN ? = 1 THEN NULL
       ELSE COALESCE(?, image_url)
      END,
      updated_at = NOW()
    WHERE id = 1
  `;

  const safeMessOpen =
    mess_open !== undefined ? Number(mess_open) : 0;

  db.query(
    query,
    [
      safeMessOpen,
      notice || "",
      menu || "",
      removeImage ? 1 : 0,
      image_url
    ],
    (err) => {

      if (err) {
        console.error("Mess settings update error:", err);
        return res.status(500).json({
          message: "Failed to update mess settings"
        });
      }

      res.json({
        message: "Mess settings updated successfully"
      });

    }
  );

};
