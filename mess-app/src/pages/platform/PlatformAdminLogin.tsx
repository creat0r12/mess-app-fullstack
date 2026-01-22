import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

const PlatformAdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Trying platform admin login:", { email, password });

        try {
            const res = await axios.post(
                `${API}/api/admin/platform-admin/login`,
                { email, password }
            );


            console.log("Login success:", res.data);

            localStorage.setItem("platform_admin_token", res.data.token);
            navigate("/platform-admin/mess-requests");
        } catch (err: any) {
            console.error("Login error:", err?.response?.data || err);
            alert(err?.response?.data?.message || "Login failed");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Platform Admin Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />

                <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default PlatformAdminLogin;
