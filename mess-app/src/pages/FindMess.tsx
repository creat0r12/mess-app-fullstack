import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/findMess.css";

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
    navigate("/student/request", {
      state: {
        mess_id: mess.id,
        mess_name: mess.name,
      },
    });
  };

  return (
    <div className="find-mess-page">
      <h2>Available Messes</h2>

      {messes.length === 0 && (
        <div className="no-mess">
          No active messes available right now.
        </div>
      )}

      {messes.map((m) => (
        <div key={m.id} className="mess-card">
          <div className="mess-name">{m.name}</div>

          <div className="mess-info">
            📞 Phone: {m.phone}
          </div>

          <div className="mess-info">
            ✉️ Email: {m.email || "N/A"}
          </div>

          <div className="mess-info">
            📍 Address: {m.address}
          </div>

          <div className="mess-action">
            <button onClick={() => handleRequest(m)}>
              Request to Join
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FindMess;
