import React, { useState } from "react";
import "../styles.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("http://localhost:5050/create-new-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.status === 201) {
        setMessage(data.message);
        setIsSuccess(true);
        setFormData({ name: "", email: "", password: "" });
      } else {
        setMessage(data.message);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Something went wrong. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div id="signUpPage">
      <form id="signUpForm" onSubmit={handleSubmit}>
        <h4>Welcome to ConsultansEase!</h4>

        <input
          type="text"
          id="userName"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          id="userEmail"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          id="userPassword"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {message && (
          <p className={isSuccess ? "success-msg" : "error-msg"}>{message}</p>
        )}

        <button type="submit">Submit</button>

        <a href="/" id="backToLogin">
          Back to Login {">"}
        </a>
      </form>
    </div>
  );
}

export default Signup;
