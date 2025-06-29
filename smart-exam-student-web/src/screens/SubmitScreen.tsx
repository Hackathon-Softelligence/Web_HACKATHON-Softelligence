"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const SubmitScreen: React.FC = () => {
  const navigate = useNavigate()

  // This could be passed as props or from context in a real app
  const submissionReason = "Exam submitted successfully"
  const isSuccess = true

  return (
    <div className="container">
      <div className="header">
        <h1>Exam Submission</h1>
        <p>Gửi bài và xác nhận hoàn thành</p>
      </div>

      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="card text-center" style={{ maxWidth: "600px", width: "100%" }}>
          <div style={{ marginBottom: "30px" }}>
            {isSuccess ? (
              <div style={{ color: "var(--teal)", fontSize: "48px", marginBottom: "20px" }}>✓</div>
            ) : (
              <div style={{ color: "var(--error-red)", fontSize: "48px", marginBottom: "20px" }}>⚠</div>
            )}

            <h2 style={{ color: "var(--deep-blue)", marginBottom: "15px" }}>
              {isSuccess ? "Exam Completed Successfully!" : "Exam Terminated"}
            </h2>

            <p style={{ color: "var(--medium-blue)", fontSize: "16px", marginBottom: "30px" }}>{submissionReason}</p>
          </div>

          <div
            style={{
              backgroundColor: "#F5F5F5",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "30px",
              textAlign: "left",
            }}
          >
            <h3 style={{ color: "var(--teal)", marginBottom: "15px" }}>Submission Details:</h3>
            <div className="flex-between mb-20">
              <span>Submission Time:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex-between mb-20">
              <span>Questions Answered:</span>
              <span>2 of 3</span>
            </div>
            <div className="flex-between mb-20">
              <span>Time Spent:</span>
              <span>45 minutes</span>
            </div>
            <div className="flex-between">
              <span>Status:</span>
              <span
                style={{
                  color: isSuccess ? "var(--success-green)" : "var(--error-red)",
                  fontWeight: "bold",
                }}
              >
                {isSuccess ? "Submitted" : "Terminated"}
              </span>
            </div>
          </div>

          <div className="flex gap-20 flex-center">
            <button className="btn-primary" onClick={() => navigate("/feedback")}>
              Continue
            </button>

            <button className="btn-secondary" onClick={() => window.open("/support", "_blank")}>
              Report an Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitScreen
