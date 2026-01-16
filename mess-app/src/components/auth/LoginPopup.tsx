import { useState } from "react";
import { saveToken } from "../../utils/auth";
import "../../styles/authCard.css";

type Props = {
    onClose: () => void;
};



// 
// const testRegister = async () => {
//     try {
//         const random = Date.now(); // always unique

//         const res = await fetch("http://localhost:5000/api/auth/register", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 name: "Test Student",
//                 email: `student${random}@test.com`,
//                 phone: `7${random.toString().slice(0, 9)}`,
//                 password: "student123",
//             }),
//         });

//         const data = await res.json();
//         console.log(data);
//         alert(data.message);
//     } catch (e) {
//         alert("Register failed");
//     }
// };


// 


const LoginPopup = ({ onClose }: Props) => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!identifier || !password) {
            setError("Please fill all fields");
            return;
        }

        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    identifier,
                    password,
                }),
            });

            let data: any = null;

            // ✅ SAFELY try to parse JSON
            try {
                data = await res.json();
            } catch {
                // backend sent non-JSON response
            }

            if (!res.ok) {
                setError(data?.message || "Invalid credentials");
                return;
            }

            if (!data?.token) {
                setError("Login failed");
                return;
            }

            // ✅ SAVE TOKEN
            saveToken(data.token);
            localStorage.setItem("role", data.role);


            // ✅ CLOSE POPUP
            onClose();

        } catch (err) {
            setError("Unable to login. Please try again.");
        }
    };



    return (
        <div className="login-popup">
            <h2>Login</h2>

            <input
                placeholder="Phone or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button onClick={handleLogin}>Login</button>

            {/* <button
                style={{ marginTop: 12, background: "#ccc", color: "#000" }}
                onClick={onClose}
            >
                Cancel
            </button> */}

            {/* <button onClick={testRegister}>Test Student Register</button> */}


        </div>
    );
};

export default LoginPopup;
