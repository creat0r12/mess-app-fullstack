import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import "../../styles/ActiveStudents.css";

type Student = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  room_number?: string;
  created_at?: string;
};

const ActiveStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/students/active",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        alert("Failed to load active students");
        return;
      }

      const data = await res.json();
      setStudents(data);
    } catch (err) {
      alert("Server error while fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  return (
    <div className="active-students-container">
      <h2 className="active-students-title">Active Students</h2>

      {loading && <p>Loading students...</p>}

      {!loading && students.length === 0 && (
        <p className="no-students">No active students found</p>
      )}

      {!loading && students.length > 0 && (
        <table className="active-students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Room</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone || "-"}</td>
                <td>{s.email || "-"}</td>
                <td>{s.room_number || "-"}</td>
                <td>
                  {s.created_at
                    ? new Date(s.created_at).toLocaleDateString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ActiveStudents;
