import { useEffect, useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}";

const PlatformMessRequests = () => {
  const [messes, setMesses] = useState<any[]>([]);

  const token = localStorage.getItem("token");


  const fetchMesses = async () => {
    try {
      const res = await axios.get(
        `${API}/api/admin/platform-admin/mess-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMesses(res.data);
    } catch {
      alert("Unauthorized");
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/platform-admin/login";
      return;
    }
    fetchMesses();
  }, []);

  const approveMess = async (id: number) => {
    await axios.put(
      `${API}/api/admin/platform-admin/mess-approve/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchMesses();
  };

  const rejectMess = async (id: number) => {
    await axios.put(
      `${API}/api/admin/platform-admin/mess-reject/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchMesses();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Mess Requests</h2>

      {messes.map((m) => (
        <div
          key={m.id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <b>{m.name}</b>
          <p>Phone: {m.phone}</p>
          <p>Email: {m.email || "N/A"}</p>
          <p>Address: {m.address}</p>
          <p>Status: {m.status}</p>

          {m.status === "PENDING_VERIFICATION" && (
            <>
              <button onClick={() => approveMess(m.id)}>
                Approve
              </button>

              <button
                onClick={() => rejectMess(m.id)}
                style={{ marginLeft: 10 }}
              >
                Reject
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlatformMessRequests;
