import { useState } from "react";
import axios from "axios";

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Basic validations
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
        email: form.email?.trim() || null,
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
    <div style={{ padding: 20 }}>
      <h2>Create Mess Request</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Mess Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="phone"
          placeholder="Phone (10 digits)"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={handleChange}
        />
        <br />

        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Create Admin Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default CreateMess;
