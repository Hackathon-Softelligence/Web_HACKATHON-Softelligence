"use client"

import CameraPreview from "@/components/ui/camera-preview"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface ChecklistItem {
  id: string
  label: string
  status: "checking" | "pass" | "fail"
}

const PreExamSetup: React.FC = () => {
  const navigate = useNavigate()
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "camera", label: "Camera is connected", status: "checking" },
    { id: "microphone", label: "Microphone is working", status: "checking" },
    { id: "internet", label: "Internet is stable", status: "checking" },
  ])

  // Face verification state
  const [faceVerificationDone, setFaceVerificationDone] = useState(false)
  const [isVerificationRunning, setIsVerificationRunning] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState("Click the button below to start")

  useEffect(() => {
    // Simulate checking process
    const timer = setTimeout(() => {
      setChecklist([
        { id: "camera", label: "Camera is connected", status: "pass" },
        { id: "microphone", label: "Microphone is working", status: "pass" },
        { id: "internet", label: "Internet is stable", status: "pass" },
      ])
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // This function is called by the CameraPreview component upon success
  const handleVerificationSuccess = (isSuccess: boolean) => {
    setIsVerificationRunning(false) // Stop the camera
    if (isSuccess) {
      setFaceVerificationDone(true)
      setVerificationMessage("Face verification successful!")
    } else {
      setFaceVerificationDone(false)
      setVerificationMessage("Face not detected. Please try again.")
    }
  }
  
  // This function is called when the user clicks the verification button
  const handleStartVerification = () => {
    setIsVerificationRunning(true)
    setVerificationMessage("Centering your face in the frame...")
  }


  const canProceed = checklist.every((item) => item.status === "pass") && faceVerificationDone

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return "✓"
      case "fail":
        return "✗"
      default:
        return "⟳"
    }
  }

  // Determine button text based on the current state
  const getButtonText = () => {
    if (faceVerificationDone) return "✓ Face Verification Complete"
    if (isVerificationRunning) return "Verifying..."
    return "Run Face Verification"
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Pre-Exam Setup</h1>
        <p>Hướng dẫn chuẩn bị môi trường thi</p>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h2 style={{ color: "var(--deep-blue)", marginBottom: "20px" }}>System Check</h2>

          {checklist.map((item) => (
            <div
              key={item.id}
              className={`status-indicator ${
                item.status === "pass" ? "status-pass" : item.status === "fail" ? "status-fail" : ""
              }`}
            >
              <span className="checkmark">{getStatusIcon(item.status)}</span>
              <span>{item.label}</span>
            </div>
          ))}

          {/* Camera Feed */}
          <div className="camera-preview">
            <CameraPreview
              // Pass a callback function to be triggered on success/failure
              onVerificationComplete={handleVerificationSuccess}
              // The camera is only active when we are running the verification
              isActive={isVerificationRunning}
            />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 15px',
              borderRadius: '15px',
              fontSize: '20px',
              textAlign: 'center',
              width: 'fit-content',
              whiteSpace: 'nowrap'
            }}>
              {verificationMessage}
            </div>
          </div>

          <div className="mb-20">
            <button 
              className="btn-secondary" 
              onClick={handleStartVerification} 
              // Disable button if verification is complete OR if it's currently running
              disabled={faceVerificationDone || isVerificationRunning}
            >
              {getButtonText()}
            </button>
          </div>

          <button className="btn-primary" onClick={() => navigate("/environment-check")} disabled={!canProceed}>
            Start Environment Check
          </button>
        </div>

        <div className="sidebar">
          <h3 style={{ color: "var(--teal)", marginBottom: "15px" }}>Preparation Guide</h3>
          <div style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p>
              <strong>1. Clean your desk</strong>
            </p>
            <p>Remove all unnecessary items from your workspace</p>

            <p style={{ marginTop: "15px" }}>
              <strong>2. Good lighting</strong>
            </p>
            <p>Ensure your face is well-lit and clearly visible</p>

            <p style={{ marginTop: "15px" }}>
              <strong>3. Quiet environment</strong>
            </p>
            <p>Make sure no one else is around during the exam</p>

            <p style={{ marginTop: "15px" }}>
              <strong>4. Stable internet</strong>
            </p>
            <p>Test your connection and close unnecessary applications</p>

            <p style={{ marginTop: "15px" }}>
              <strong>5. Camera position</strong>
            </p>
            <p>Position camera at eye level, showing your full face</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreExamSetup
