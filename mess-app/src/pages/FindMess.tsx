import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/findMess.css";

const API = "http://localhost:5000";

const FindMess = () => {
  const [messes, setMesses] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
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

  const toggleCard = (id: number) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="find-mess-page">
      <h2>Available Messes</h2>

      {messes.length === 0 && (
        <div className="no-mess">
          No active messes available right now.
        </div>
      )}

      {messes.map((m) => {
        const isActive = activeId === m.id;

        return (
          <div
            key={m.id}
            className={`mess-card ${isActive ? "active" : ""}`}
            onClick={() => toggleCard(m.id)}
          >
            {/* Avatar Space */}
            <div className="mess-avatar">
              {m.image ? (
                <img src={m.image} alt="mess" />
              ) : (
                <div className="avatar-placeholder">🍽️</div>
              )}
            </div>

            {/* Basic Info */}
            <div className="mess-content">
              <div className="mess-name">{m.name}</div>

              <div className="mess-info">
                👤 Owner: {m.owner_name || "N/A"}
              </div>

              <div className="mess-info">
                📍 {m.address}
              </div>

              <div className="mess-info">
                📞 {m.phone}
              </div>

              <div className="mess-info">
                ✉️ {m.email || "N/A"}
              </div>

              {/* EXPANDED SECTION */}
              {isActive && (
                <div className="mess-expanded">

                  {/* Pricing Chart */}
                  <div className="price-chart">

                    {/* HEADER */}
                    <div className="price-row header">
                      <span>Type</span>
                      <span>Girls</span>
                      <span>Boys</span>
                    </div>

                    <div className="price-row">
                      <span>1 Time</span>

                      {/* Girls */}
                      <span>
                        {m.girls_one_time ? `₹${m.girls_one_time}` : "—"}
                      </span>

                      {/* Boys */}
                      <span>
                        {m.boys_one_time ? `₹${m.boys_one_time}` : "—"}
                      </span>
                    </div>

                    <div className="price-row">
                      <span>2 Time</span>

                      {/* Girls */}
                      <span>
                        {m.girls_two_time ? `₹${m.girls_two_time}` : "—"}
                      </span>

                      {/* Boys */}
                      <span>
                        {m.boys_two_time ? `₹${m.boys_two_time}` : "—"}
                      </span>
                    </div>

                  </div>

                  {/* TIMING */}
                  <div className="mess-timing">
                    ⏰ Morning: 10:30 AM – 1:00 PM <br />
                    🌙 Night: 7:00 PM – 9:00 PM
                  </div>
                </div>
              )}

              {/* ALWAYS VISIBLE BUTTON */}
              <div
                className="mess-action"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => handleRequest(m)}>
                  Join Mess
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FindMess;