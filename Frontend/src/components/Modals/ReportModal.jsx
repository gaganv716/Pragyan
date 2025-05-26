import React from 'react';
import "./ReportModel.css" // Import your CSS file for styling

const ReportModal = ({ isOpen, toggleModal }) => {
  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay">
      <div className="report-modal">
      <div className="report-modal-header">
        <h2 style={{ color: "#b71c1c", marginBottom: "12px" }}>⚠️ Report Alert</h2>
      </div>
        <div className="report-modal-body">
          The Content you Received is 
          <span style={{ textDecoration: "underline", fontWeight: "bold" }}> {"Toxic"} </span> 
          and 
          <span style={{ textDecoration: "underline", fontWeight: "bold" }}> {"Negative"} </span>
        </div>
        <hr />
        <div className="report-modal-body">
          Do You Want to Report this to <a href="https://bcp.karnataka.gov.in/en">Police</a>
        </div>
        <button className="report-close-btn" onClick={toggleModal}>Close</button>
      </div>
    </div>
  );
};

export default ReportModal;
