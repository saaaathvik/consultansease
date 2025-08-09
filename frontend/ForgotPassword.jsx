import React, { useState } from "react";
import "../styles.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordResetDone, setPasswordResetDone] = useState(false);
  const [disableAll, setDisableAll] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5050/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setMessage("OTP sent to your email! Please check your inbox/spam.");
        setShowOtpInput(true);
      } else {
        setMessage(data.message || "Something went wrong. Please try again.");
        setShowOtpInput(false);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage("Error sending OTP. Please try again later.");
      setShowOtpInput(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOtpError("");

    try {
      const response = await fetch("http://localhost:5050/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setOtpVerified(true);
        setMessage("OTP verified! You may now reset your password.");
      } else {
        setOtpError(
          data.message || "OTP verification failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5050/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setMessage("Password updated successfully!");
        setPasswordResetDone(true);
        setDisableAll(true);
      } else {
        setMessage(data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("Internal server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgotPasswordPage">
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <p>Loading, please wait...</p>
        </div>
      ) : otpVerified ? (
        <form id="resetPasswordForm" onSubmit={handleResetPassword}>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={disableAll}
          />
          {message && (
            <p
              className={
                passwordResetDone || otpVerified ? "success-msg" : "error-msg"
              }
            >
              {message}
            </p>
          )}
          {!passwordResetDone && (
            <button type="submit" disabled={disableAll}>
              Submit
            </button>
          )}
          <a
            href="/"
            id="backToLogin"
            style={passwordResetDone ? { marginTop: 0 } : {}}
          >
            Back to Login &gt;
          </a>
        </form>
      ) : (
        <form
          id="emailForm"
          onSubmit={showOtpInput ? handleOtpSubmit : handleSubmit}
        >
          <h4>Forgot your password? No worries.</h4>

          <input
            type="email"
            id="userEmail"
            name="userEmail"
            placeholder="Email"
            required
            value={email}
            disabled={disableAll || showOtpInput}
            onChange={(e) => setEmail(e.target.value)}
          />

          {message && !otpVerified && (
            <p className={showOtpInput ? "success-msg" : "error-msg"}>
              {message}
            </p>
          )}

          {showOtpInput && (
            <>
              <input
                type="text"
                id="otpInput"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={disableAll}
              />
              {otpError && <p className="error-msg">{otpError}</p>}
              <button type="submit" disabled={disableAll}>
                Verify OTP
              </button>
            </>
          )}

          {!showOtpInput && (
            <button type="submit" disabled={disableAll}>
              Submit
            </button>
          )}

          <a href="/" id="backToLogin">
            Back to Login &gt;
          </a>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
