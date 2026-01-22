// FindMess.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const FindMess = () => {
  const [messes, setMesses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API}/api/admin/public/active-messes`)
      .then((res) => setMesses(res.data))
      .catch(() => alert("Failed to load messes"));
  }, []);

  const handleRequest = (mess: any) => {
    // ✅ Redirect to Student Request (NOT login)
    navigate("/student/request", {
      state: {
        mess_id: mess.id,
        mess_name: mess.name,
      },
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Available Messes</h2>

      {messes.map((m) => (
        <div
          key={m.id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <b>{m.name}</b>
          <p>Phone: {m.phone}</p>
          <p>Email: {m.email || "N/A"}</p>
          <p>Address: {m.address}</p>

          <button onClick={() => handleRequest(m)}>
            Request to Join
          </button>
        </div>
      ))}
    </div>
  );
};

export default FindMess;
