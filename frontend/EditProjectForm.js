import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Forms.css";
import { useNavigate } from "react-router-dom";

const EditProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        navigate("/home");
      }, 5000);
      return () => clearTimeout(timer); // Cleanup
    }
  }, [submitted, navigate]);

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5050/edit/${id}`);
        const data = await res.json();

        setFormData({
          industry: data[1],
          duration: data[2] || "",
          title: data[3] || "",
          pi: data[4] || "",
          copi: data[5] || "",
          year: data[6] || "",
          sanctioned: data[7] || "",
          received: data[8] || "",
          billProof: null,
          agreementDoc: null,
          students: data[11] || "",
          summary: data[12] || "",
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFormData = new FormData();
    for (const key in formData) {
      updatedFormData.append(key, formData[key]);
    }

    try {
      const res = await fetch(`http://localhost:5050/edit/${id}`, {
        method: "PUT", // or PATCH depending on backend
        body: updatedFormData,
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        console.log(data);
        setSubmitted(true);
      } else {
        const text = await res.text();
        console.error("Non-JSON response:", text);
      }
    } catch (err) {
      console.error("Error updating form:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

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
          type="text"
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

        <label>Add New Bill Proof Document:</label>
        <input
          type="file"
          name="billProof"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.ppt,.pptx,.txt"
          onChange={handleChange}
        />

        <label>Add New Agreement Document:</label>
        <input
          type="file"
          name="agreementDoc"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.ppt,.pptx,.txt"
          onChange={handleChange}
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

        <button type="submit">Update</button>

        <a href="/home" id="backToHome">
          Back to Home {">"}
        </a>
      </form>

      {submitted && (
        <div className="success-message">
          Form updated successfully! Redirecting...
        </div>
      )}
    </div>
  );
};

export default EditProjectForm;
