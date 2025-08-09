import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5050/validate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("isAuthenticated", "true");
        setLoginSuccess(true);
        setMessage(data.message);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setLoginSuccess(false);
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginSuccess(false);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div id="loginPage">
      <div id="loginBox">
        <h4>ConsultansEase</h4>

        <form id="loginForm" onSubmit={handleSubmit}>
          <input
            type="email"
            id="userEmail"
            name="userEmail"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            id="userPassword"
            name="userPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {message && (
            <p className={loginSuccess ? "success-msg" : "error-msg"}>
              {message}
            </p>
          )}

          <div id="submitDiv">
            <button type="submit">Login</button>
            <a href="/forgotpassword" id="forgetPassword">
              Forgot Password? {">"}
            </a>
            <a href="/signup" id="signUp">
              Don't have an account? Sign up {">"}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
