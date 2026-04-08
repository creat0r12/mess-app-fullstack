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

const API = `${import.meta.env.VITE_API_URL}";

const MessSettings = () => {

  const [removeImage, setRemoveImage] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [messOpen, setMessOpen] = useState(false);

  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  /* =========================
     LOAD SETTINGS
  ========================= */

  useEffect(() => {
    const load = async () => {
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
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) load();

  }, [token]);

  /* =========================
     IMAGE
  ========================= */

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* =========================
     SAVE
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

      // ✅ ADD THIS
      if (removeImage) {
        form.append("remove_image", "1");
      }

      await axios.put(`${API}/api/mess-settings`, form, { headers });

      alert("Mess settings saved");

      setImageFile(null);
      setRemoveImage(false);
    } catch (err) {
      console.error(err);
      alert("Save failed");

    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div className="mess-settings-page">




      {/* SLIDE SECTION */}

      <div className={`mess-details ${messOpen ? "show" : ""}`}>

        {/* NOTICE + MENU SIDE BY SIDE */}

        <div className="row-two">

          {/* NOTICE */}
          <div className="card">
            <h4>Notice</h4>
            <input
              type="text"
              value={notice}
              placeholder="Notice..."
              onChange={(e) => setNotice(e.target.value)}
            />
          </div>

          {/* MENU */}
          <div className="card">
            <h4>Menu</h4>
            <input
              type="text"
              value={menu}
              placeholder="Menu..."
              onChange={(e) => setMenu(e.target.value)}
            />
          </div>

        </div>


        {/* IMAGE */}

        <div className="card">

          <h4>Image (Optional)</h4>

          {imagePreview ? (
            <>
              <img
                src={imagePreview}
                alt="Mess"
                className={`image-preview ${isExpanded ? "expanded" : ""}`}
                onClick={() => setIsExpanded(!isExpanded)}
              />

              <button
                className="remove-btn"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setRemoveImage(true);   // 🔥 important
                }}
              >
                Remove Image
              </button>
            </>
          ) : (
            <p className="muted">No image uploaded</p>
          )}

          <label className="upload-btn">
            Upload Image

            <input
              type="file"
              hidden
              accept="image/*"
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

    </div>
  );
};

export default MessSettings;