import { useState } from "react";
import axios from "axios";
import "../styles/createMess.css";

const API = "http://localhost:5000";

const CreateMess = () => {
  const [form, setForm] = useState({
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
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        description: form.description.trim(),
        password: form.password,
      });

      alert("✅ Mess request submitted successfully!");

      setForm({
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

        <form
          className="create-mess-form"
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          {/* Mess Name */}
          <label htmlFor="name">Mess Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter mess name"
            autoComplete="organization"
            required
          />

          {/* Phone */}
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            autoComplete="tel"
            inputMode="numeric"
            required
          />

          {/* Email */}
          <label htmlFor="email">Email (optional)</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            autoComplete="email"
          />

          {/* Address */}
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter full address"
            autoComplete="street-address"
            required
          />

          {/* Description */}
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description about your mess"
            autoComplete="off"
            required
          />

          {/* Password */}
          <label htmlFor="password">Create Admin Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            required
          />

          {/* Confirm Password */}
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMess;
