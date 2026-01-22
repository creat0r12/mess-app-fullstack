import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/authCard.css";

const API = "http://localhost:5000";

function StudentRequest() {
  // 🔐 SET AUTH MODE AS STUDENT
  useEffect(() => {
    localStorage.setItem("authMode", "STUDENT");
  }, []);

  const location = useLocation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [messId, setMessId] = useState<number | "">("");
  const [mealSlot, setMealSlot] = useState(""); // ✅ LUNCH | DINNER | BOTH
  const [messes, setMesses] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Load active messes
  useEffect(() => {
    fetch(`${API}/api/admin/public/active-messes`)
      .then((res) => res.json())
      .then((data) => setMesses(data))
      .catch(() => setMessage("Failed to load mess list"));
  }, []);

  // ✅ Preselect mess if redirected
  useEffect(() => {
    if (location.state?.mess_id) {
      setMessId(location.state.mess_id);
    }
  }, [location.state]);

  const submitRequest = async () => {
    // 🔒 VALIDATIONS
    if (!name.trim()) return setMessage("Name is required");
    if (!/^\d{10}$/.test(phone))
      return setMessage("Phone number must be exactly 10 digits");
    if (!gender) return setMessage("Please select gender");
    if (!messId) return setMessage("Please select a mess");
    if (!mealSlot) return setMessage("Please select meal slot");
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return setMessage("Name can contain only letters");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API}/api/students/request-mess`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          gender,
          email: email || null,
          mess_id: messId,
          meal_slot: mealSlot, // ✅ LUNCH | DINNER | BOTH
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Request failed");
        return;
      }

      setMessage("✅ Request sent. Please wait for admin approval.");
      setName("");
      setPhone("");
      setEmail("");
      setGender("");
      setMessId("");
      setMealSlot("");
    } catch (err) {
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Mess Admission Request</h2>

        {/* Name */}
        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-Z\s]*$/.test(value)) {
              setName(value);
            }
          }}
        />

        {/* Phone */}
        <input
          placeholder="Phone Number (10 digits)"
          value={phone}
          maxLength={10}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, ""))
          }
        />

        {/* Gender */}
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>

        {/* Mess Selection */}
        <select value={messId} onChange={(e) => setMessId(Number(e.target.value))}>
          <option value="">Select Mess</option>
          {messes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Meal Slot Selection */}
        <select value={mealSlot} onChange={(e) => setMealSlot(e.target.value)}>
          <option value="">Select Meal Slot</option>
          <option value="LUNCH">Lunch Only</option>
          <option value="DINNER">Dinner Only</option>
          <option value="BOTH">Lunch + Dinner</option>
        </select>

        {/* Email */}
        <input
          placeholder="Email Address (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {message && <p>{message}</p>}

        <button onClick={submitRequest} disabled={loading}>
          {loading ? "Submitting..." : "Request Mess Access"}
        </button>

        <div className="secondary-link">
          <p>
            Already approved?{" "}
            <a href="/student/login">Student Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default StudentRequest;
