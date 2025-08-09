import React, { useState, useEffect } from "react";
import "./Forms.css";
import { useNavigate } from "react-router-dom";

const AddProjectForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    industry: "",
    duration: "",
    title: "",
    pi: "",
    copi: "",
    year: "",
    sanctioned: "",
    received: "",
    billProof: null,
    agreementDoc: null,
    students: "",
    summary: "",
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        navigate("/home");
      }, 5000);
      return () => clearTimeout(timer); // Cleanup
    }
  }, [submitted, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await fetch("http://localhost:5050/forms", {
        method: "POST",
        body: formDataToSend,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log(data);
        setSubmitted(true);

        // Redirect to home page after submission
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <label>Industry:</label>
        <input
          type="text"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          required
        />

        <label>Duration:</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
        />

        <label>Title of Project:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label>Principal Investigator:</label>
        <input
          type="text"
          name="pi"
          value={formData.pi}
          onChange={handleChange}
          required
        />

        <label>Co-PI:</label>
        <input
          type="text"
          name="copi"
          value={formData.copi}
          onChange={handleChange}
          required
        />

        <label>Year:</label>
        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        />

        <label>Sanctioned Amount:</label>
        <input
          type="number"
          name="sanctioned"
          value={formData.sanctioned}
          onChange={handleChange}
          required
        />

        <label>Amount Received:</label>
        <input
          type="number"
          name="received"
          value={formData.received}
          onChange={handleChange}
          required
        />

        <label>Bill Proof Document:</label>
        <input
          type="file"
          name="billProof"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.ppt,.pptx,.txt"
          onChange={handleChange}
          required
        />

        <label>Agreement Document:</label>
        <input
          type="file"
          name="agreementDoc"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.ppt,.pptx,.txt"
          onChange={handleChange}
          required
        />

        <label>Students Involved:</label>
        <input
          type="text"
          name="students"
          value={formData.students}
          onChange={handleChange}
          required
        />

        <label>Summary of Work Done:</label>
        <textarea
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          required
        ></textarea>

        <button type="submit">Submit</button>

        <a href="/home" id="backToHome">
          Back to Home {">"}
        </a>
      </form>

      {submitted && (
        <div className="success-message">
          Form submitted successfully! Redirecting...
        </div>
      )}
    </div>
  );
};

export default AddProjectForm;
