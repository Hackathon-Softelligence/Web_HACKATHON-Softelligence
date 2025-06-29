"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

interface CheckResult {
  category: string
  status: "pass" | "fail" | "warning"
  message: string
  suggestion?: string
}

const EnvironmentCheckResult: React.FC = () => {
  const navigate = useNavigate()

  const results: CheckResult[] = [
    {
      category: "Lighting",
      status: "pass",
      message: "Lighting conditions are optimal",
    },
    {
      category: "Face alignment",
      status: "warning",
      message: "Face partially visible",
      suggestion: "Please adjust your camera position to show your full face",
    },
    {
      category: "Background noise",
      status: "pass",
      message: "Environment is quiet",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "var(--success-green)"
      case "fail":
        return "var(--error-red)"
      case "warning":
        return "var(--warning-orange)"
      default:
        return "var(--light-gray)"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pass":
        return "PASS"
      case "fail":
        return "FAIL"
      case "warning":
        return "WARNING"
      default:
        return "UNKNOWN"
    }
  }

  const canContinue = results.every((result) => result.status !== "fail")

  return (
    <div className="container">
      <div className="header">
        <h1>Environment Check Results</h1>
        <p>Thông báo điều kiện phòng đạt/không đạt</p>
      </div>

      <div className="card">
        <h2 style={{ color: "var(--deep-blue)", marginBottom: "30px" }}>Check Summary</h2>

        {results.map((result, index) => (
          <div key={index} className="mb-20">
            <div className="flex-between mb-20">
              <h3>{result.category}</h3>
              <span
                style={{
                  backgroundColor: getStatusColor(result.status),
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {getStatusText(result.status)}
              </span>
            </div>

            <p style={{ color: "var(--medium-blue)", marginBottom: "10px" }}>{result.message}</p>

            {result.suggestion && (
              <div
                style={{
                  backgroundColor: "var(--light-blue)",
                  padding: "15px",
                  borderRadius: "6px",
                  border: "1px solid var(--medium-blue)",
                }}
              >
                <strong>Suggestion:</strong> {result.suggestion}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-20 mt-20">
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Re-check Environment
          </button>

          <button className="btn-primary" onClick={() => navigate("/instructions")} disabled={!canContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentCheckResult
