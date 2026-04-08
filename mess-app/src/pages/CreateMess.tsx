import { useState } from "react";
import axios from "axios";
import "../styles/createMess.css";

const API = import.meta.env.VITE_API_URL;

const CreateMess = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    owner_name: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.phone)) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/api/admin/create-mess-request`, {
        owner_name: form.owner_name.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        description: form.description.trim() || null,
        password: form.password,
      });

      alert("✅ Mess request submitted successfully!");

      setForm({
        owner_name: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        description: "",
        password: "",
        confirmPassword: "",
      });

    } catch (err: any) {
      alert(err?.response?.data?.message || "❌ Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-mess-page">
      <div className="create-mess-card">
        <h2>Create Mess Request</h2>

        <form className="create-mess-form" onSubmit={handleSubmit}>

          {/* ROW 1 */}
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input
                name="owner_name"
                value={form.owner_name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Mess Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Mess name"
                required
              />
            </div>
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit phone"
              required
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>

          {/* ADDRESS */}
          <div className="form-group">
            <label>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full address"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
              rows={2}
              required
            />
          </div>

          {/* PASSWORD ROW */}
          <div className="form-row">

            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  required
                />
                <span
                  className="toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="form-group password-group">
              <label>Confirm</label>
              <div className="password-wrapper">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm"
                  required
                />
                <span
                  className="toggle-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateMess;