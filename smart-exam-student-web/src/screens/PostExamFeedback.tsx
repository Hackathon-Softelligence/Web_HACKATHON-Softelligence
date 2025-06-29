"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const PostExamFeedback: React.FC = () => {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [showChatbot, setShowChatbot] = useState(false)

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1)
  }

  const handleYesClick = () => {
    setShowChatbot(true)
  }

  const handleNoClick = () => {
    // In a real app, this might redirect to a dashboard or home page
    alert("Thank you for your feedback!")
    navigate("/")
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Post-Exam Feedback</h1>
        <p>Hỏi: "Bạn gặp sự cố gì không?", liên kết tới chatbot hỗ trợ</p>
      </div>

      <div className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="card text-center" style={{ maxWidth: "500px", width: "100%" }}>
          <h2 style={{ color: "var(--deep-blue)", marginBottom: "30px" }}>How was your exam experience?</h2>

          <div className="mb-20">
            <p style={{ marginBottom: "20px", color: "var(--medium-blue)" }}>
              Did you experience any technical issues during the exam?
            </p>

            <div className="flex gap-20 flex-center mb-20">
              <button className="btn-primary" onClick={handleYesClick} style={{ minWidth: "100px" }}>
                Yes
              </button>
              <button className="btn-secondary" onClick={handleNoClick} style={{ minWidth: "100px" }}>
                No
              </button>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--light-gray)", paddingTop: "30px" }}>
            <p style={{ marginBottom: "20px", color: "var(--medium-blue)" }}>Please rate your overall experience:</p>

            <div className="star-rating">
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`star ${index < rating ? "active" : ""}`}
                  onClick={() => handleStarClick(index)}
                >
                  ★
                </span>
              ))}
            </div>

            {rating > 0 && (
              <p style={{ marginTop: "15px", color: "var(--teal)" }}>
                Thank you for rating: {rating} star{rating !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {showChatbot && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                backgroundColor: "var(--light-blue)",
                borderRadius: "8px",
                border: "1px solid var(--medium-blue)",
              }}
            >
              <h3 style={{ color: "var(--deep-blue)", marginBottom: "15px" }}>Support Chatbot</h3>
              <p style={{ marginBottom: "15px", fontSize: "14px" }}>
                Hi! I'm here to help with any technical issues you experienced. What problem did you encounter?
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                <button className="btn-secondary" style={{ fontSize: "12px", padding: "8px 12px" }}>
                  Camera Issues
                </button>
                <button className="btn-secondary" style={{ fontSize: "12px", padding: "8px 12px" }}>
                  Audio Problems
                </button>
                <button className="btn-secondary" style={{ fontSize: "12px", padding: "8px 12px" }}>
                  Connection Issues
                </button>
                <button className="btn-secondary" style={{ fontSize: "12px", padding: "8px 12px" }}>
                  Other
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostExamFeedback
