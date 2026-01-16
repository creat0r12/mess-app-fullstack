import { useState, useEffect } from "react";
import "../../styles/authCard.css";

function StudentRequest() {
  // 🔐 SET AUTH MODE AS STUDENT (VERY IMPORTANT)
  useEffect(() => {
    localStorage.setItem("authMode", "STUDENT");
  }, []);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    // 🔒 VALIDATIONS (STRICT BUT USER-FRIENDLY)
    if (!name.trim()) {
      setMessage("Name is required");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setMessage("Phone number must be exactly 10 digits");
      return;
    }

    if (!gender) {
      setMessage("Please select gender");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      setMessage("Name can contain only letters");
      return;
    }


    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/students/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          gender,           // ✅ compulsory
          email: email || null, // ✅ optional
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
            // allow only letters and spaces
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
