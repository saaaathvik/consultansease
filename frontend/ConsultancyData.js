import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ConsultancyData.css";

const ConsultancyData = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    academicYear: "",
    pi: "",
    industry: "",
    minSanctioned: "",
  });

  // Wrap fetchData in useCallback to prevent unnecessary re-creation
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5050/api", {
        params: filters,
      });
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Include filters as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await axios.delete(`http://localhost:5050/api/${projectId}`);
        // Refresh data after deletion
        fetchData();
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert("Failed to delete entry. Please try again.");
      }
    }
  };

  const handleDownload = async () => {
    try {
      // Get filtered data
      const response = await axios.get("http://localhost:5050/api/download", {
        params: filters,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "consultansease.xlsx");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div className="container">
      <h4>ConsultansEase Data</h4>

      {/* Filter Inputs */}
      <div className="filter-bar">
        <input
          type="text"
          name="academicYear"
          placeholder="Academic Year"
          value={filters.academicYear}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="pi"
          placeholder="PI Name"
          value={filters.pi}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="industry"
          placeholder="Industry Name"
          value={filters.industry}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="minSanctioned"
          placeholder="Minimum Sanctioned Amount"
          value={filters.minSanctioned}
          onChange={handleInputChange}
        />
        <button
          onClick={() =>
            setFilters({
              academicYear: "",
              pi: "",
              industry: "",
              minSanctioned: "",
            })
          }
        >
          Reset Filters
        </button>

        <button
          onClick={() => navigate("../add-project")}
          className="add-project-btn"
        >
          {" "}
          Add New Project
        </button>

        {/* Download Button */}
        <button onClick={handleDownload} className="download-btn">
          Download Results
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <p>Loading data...</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Project ID</th>
                <th>Industry</th>
                <th>Duration</th>
                <th>Title</th>
                <th>PI</th>
                <th>Co-PI</th>
                <th>Year</th>
                <th>Sanctioned</th>
                <th>Received</th>
                <th>Bill Proof</th>
                <th>Agreement</th>
                <th>Students</th>
                <th>Summary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="14">No data available.</td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.projectId}</td>
                    <td>{row.industry}</td>
                    <td>{row.duration}</td>
                    <td>{row.title}</td>
                    <td>{row.pi}</td>
                    <td>{row.copi}</td>
                    <td>{row.academicYear}</td>
                    <td>{row.sanctionedAmount}</td>
                    <td>{row.receivedAmount}</td>
                    <td>{row.billProofLink}</td>
                    <td>{row.agreementDocumentLink}</td>
                    <td>{row.studentParticipants}</td>
                    <td>{row.summary}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`../edit/${row.projectId}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(row.projectId)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <a href="#!" onClick={handleLogout} className="logout-link">
        Logout &gt;
      </a>
    </div>
  );
};

export default ConsultancyData;
