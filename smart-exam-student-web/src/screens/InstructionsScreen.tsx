"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const InstructionsScreen: React.FC = () => {
  const navigate = useNavigate()
  const [agreedToRules, setAgreedToRules] = useState(false)

  const examInfo = {
    duration: "120 minutes",
    questionCount: 50,
    type: "Multiple Choice & Essay",
  }

  const rules = [
    "You must remain visible to the camera at all times during the exam",
    "No additional materials, books, or notes are allowed unless specified",
    "You cannot leave the exam area during the test",
    "Any suspicious behavior will be flagged and may result in exam termination",
    "Technical issues should be reported immediately through the help system",
    "You have only one attempt to complete this exam",
    "The exam will auto-submit when time expires",
    "Screen sharing and recording will be active throughout the exam",
    "Mobile phones and other electronic devices must be put away",
    "You must complete the exam in one sitting - no breaks allowed",
  ]

  return (
    <div className="container">
      <div className="header">
        <h1>Exam Instructions</h1>
        <p>Hiển thị hướng dẫn, quy tắc thi</p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ color: "var(--teal)", marginBottom: "20px" }}>Exam Information</h2>

          <div className="mb-20">
            <div className="flex-between mb-20">
              <strong>Duration:</strong>
              <span style={{ color: "var(--medium-blue)" }}>{examInfo.duration}</span>
            </div>
            <div className="flex-between mb-20">
              <strong>Questions:</strong>
              <span style={{ color: "var(--medium-blue)" }}>{examInfo.questionCount}</span>
            </div>
            <div className="flex-between mb-20">
              <strong>Type:</strong>
              <span style={{ color: "var(--medium-blue)" }}>{examInfo.type}</span>
            </div>
          </div>

          <div className="checkbox-container">
            <input
              type="checkbox"
              id="agree-rules"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
            />
            <label htmlFor="agree-rules">I have read and agree to the exam rules and policies</label>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/exam")}
            disabled={!agreedToRules}
            style={{ width: "100%", marginTop: "20px" }}
          >
            Start Exam
          </button>
        </div>

        <div className="card">
          <h2 style={{ color: "var(--teal)", marginBottom: "20px" }}>Exam Rules & Policies</h2>

          <div className="scrollable">
            {rules.map((rule, index) => (
              <div key={index} style={{ marginBottom: "15px", paddingLeft: "20px", position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "0",
                    color: "var(--teal)",
                    fontWeight: "bold",
                  }}
                >
                  {index + 1}.
                </span>
                {rule}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructionsScreen
