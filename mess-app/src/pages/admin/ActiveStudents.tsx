import { useEffect, useState } from "react";
import { getToken } from "../../utils/auth";
import "../../styles/ActiveStudents.css";

type Student = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  room_number?: string;
  joined_at?: string;
};

const API_ROOT = "http://localhost:5000";

const ActiveStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_ROOT}/api/admin/active-students`, // ✅ FIXED ROUTE
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to load active students");
        setStudents([]);
        return;
      }

      const data = await res.json();
      console.log("ACTIVE STUDENTS:", data);
      setStudents(data || []);
    } catch (err) {
      console.error("Server error while fetching students", err);
      setStudents([]);
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
              <th>ID</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone || "-"}</td>
                <td>{s.email || "-"}</td>
                <td>{s.id}</td>
                <td>
                  {s.joined_at
                    ? new Date(s.joined_at).toLocaleDateString()
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
