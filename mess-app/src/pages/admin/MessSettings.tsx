import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/messSettings.css";

type MessSettingsType = {
  id: number;
  mess_open: number;
  notice: string | null;
  menu: string | null;
  image_url: string | null;
};

const API = "http://localhost:5000";

const MessSettings = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [messOpen, setMessOpen] = useState(true);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  /* =========================
     LOAD MESS SETTINGS
  ========================= */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await axios.get<MessSettingsType>(
          `${API}/api/mess-settings`,
          { headers }
        );

        const data = res.data;

        setMessOpen(data.mess_open === 1);
        setNotice(data.notice || "");
        setMenu(data.menu || "");

        if (data.image_url) {
          setImagePreview(`${API}${data.image_url}`);
        } else {
          setImagePreview(null);
        }
      } catch (err) {
        console.error("Failed to load mess settings", err);
        alert("Failed to load mess settings");
      } finally {
        setLoading(false);
      }
    };

    if (token) loadSettings();
  }, [token]);

  /* =========================
     HANDLE IMAGE SELECT
  ========================= */
  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* =========================
     SAVE SETTINGS
  ========================= */
  const handleSave = async () => {
    setSaving(true);

    try {
      const form = new FormData();
      form.append("mess_open", messOpen ? "1" : "0");
      form.append("notice", notice);
      form.append("menu", menu);

      if (imageFile) {
        form.append("image", imageFile);
      }

      await axios.put(`${API}/api/mess-settings`, form, { headers });

      alert("Mess settings updated successfully");

      // reload updated data
      setImageFile(null);
      setLoading(true);

      const res = await axios.get<MessSettingsType>(
        `${API}/api/mess-settings`,
        { headers }
      );

      const data = res.data;
      setMessOpen(data.mess_open === 1);
      setNotice(data.notice || "");
      setMenu(data.menu || "");

      if (data.image_url) {
        setImagePreview(`${API}${data.image_url}`);
      } else {
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save mess settings");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading mess settings…</p>;
  }

  return (
    <div className="mess-settings-page">
      <h2 className="page-title">Mess Information Settings</h2>

      {/* MESS STATUS */}
      <div className="card">
        <div className="row">
          <div>
            <h4>Mess Status</h4>
            <p className="muted">
              Turn mess ON or OFF for all students
            </p>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={messOpen}
              onChange={() => setMessOpen(!messOpen)}
            />
            <span className="slider" />
          </label>
        </div>

        <p className={`status-text ${messOpen ? "open" : "closed"}`}>
          {messOpen ? "🟢 Mess is OPEN" : "🔴 Mess is CLOSED"}
        </p>
      </div>

      {/* NOTICE */}
      <div className="card">
        <h4>Notice for Students</h4>
        <textarea
          placeholder="Write any notice for students..."
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          rows={4}
        />
      </div>

      {/* MENU */}
      <div className="card">
        <h4>Mess Menu</h4>
        <textarea
          placeholder="Write today's / weekly menu..."
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          rows={5}
        />
      </div>

      {/* IMAGE */}
      <div className="card">
        <h4>Image (Optional)</h4>

        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Mess"
            className="image-preview"
          />
        ) : (
          <p className="muted">No image uploaded</p>
        )}

        <label className="upload-btn">
          Upload / Change Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              e.target.files && handleImageChange(e.target.files[0])
            }
          />
        </label>
      </div>

      {/* SAVE */}
      <button
        className="save-btn"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default MessSettings;
