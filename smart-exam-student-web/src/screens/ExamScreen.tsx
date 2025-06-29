"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { CheatingDetectionResult } from "../models/CheatingDetectionResult"
import CameraFeed from "@/components/ui/camera-feed"

interface Question {
  id: number
  type: "mcq" | "essay"
  question: string
  options?: string[]
  answer?: string
}

interface Alert {
  id: number
  message: string
  type: "warning" | "error"
}

const ExamScreen: React.FC = () => {
  const navigate = useNavigate()
  const lastDetectionTimeRef = useRef(0);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours in seconds
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertCount, setAlertCount] = useState(0)
  const [cheatingDetections, setCheatingDetections] = useState<CheatingDetectionResult[]>([])
  const [suspiciousActivity, setSuspiciousActivity] = useState(0)
  const [lastDetectionTime, setLastDetectionTime] = useState(0)
  const [isCurrentlyViolating, setIsCurrentlyViolating] = useState(false);
  
  const questions: Question[] = [
    {
      id: 1,
      type: "mcq",
      question: "What is the capital of Vietnam?",
      options: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hue"],
    },
    {
      id: 2,
      type: "mcq",
      question: "Which programming language is primarily used for web development?",
      options: ["Python", "Java", "JavaScript", "C++"],
    },
    {
      id: 3,
      type: "essay",
      question:
        "Explain the importance of cybersecurity in modern digital infrastructure. Provide examples and discuss potential threats.",
    },
  ]

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          navigate("/submit")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [navigate])

  // Simulate random alerts
  useEffect(() => {
    const alertTimer = setInterval(() => {
    // Request camera permissions
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        console.log('Camera permission granted');
      })
      .catch((error) => {
        console.error('Camera permission denied:', error);
        alert('Camera access is required for exam monitoring. Please allow camera access and refresh the page.');
      });

      if (Math.random() < 0.3) {
        // 30% chance every 10 seconds
        const alertMessages = [
          "Please look at the screen",
          "Phone detected in frame",
          "Multiple faces detected",
          "Poor lighting detected",
        ]

        const newAlert: Alert = {
          id: Date.now(),
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          type: Math.random() < 0.7 ? "warning" : "error",
        }

        setAlerts((prev) => [...prev, newAlert])
        setAlertCount((prev) => prev + 1)

        // Remove alert after 5 seconds
        setTimeout(() => {
          setAlerts((prev) => prev.filter((alert) => alert.id !== newAlert.id))
        }, 5000)

        // Check if too many alerts
        if (alertCount >= 5) {
          navigate("/submit")
        }
      }
    }, 10000)

    return () => clearInterval(alertTimer)
  }, [alertCount, navigate])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const dismissAlert = (alertId: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
  }

  // ===============================
  //         CHEAT DETECTION
  // ===============================
  const handleCheatingDetected = useCallback((detection: CheatingDetectionResult) => {
    const now = Date.now();
    
    // Check against the .current property of the ref.
    // This value is always up-to-date, even between re-renders.
    if (now - lastDetectionTimeRef.current < 3500) {
        return;
    }
    
    // 2. Update the .current property directly. This does not cause a re-render.
    lastDetectionTimeRef.current = now;
    
    // The rest of your logic can now proceed, correctly throttled.
    setCheatingDetections(prev => [...prev.slice(-10), detection]);
    
    const isViolation = detection.isLookingAway || detection.multipleFaces || detection.noFaceDetected || detection.hasCheatingObjects;

    if (isViolation) {
        if (!isCurrentlyViolating) {
            setIsCurrentlyViolating(true);
    
            // ... (your alertMessage logic is fine)
            
            setSuspiciousActivity(currentCount => {
                const newCount = currentCount + 1;
                console.log(`Violation #${newCount} recorded.`);

                if (newCount >= 10) {
                    alert("Too many violations detected. Exam will be submitted automatically.");
                    navigate("/submit");
                }
                
                return newCount;
            });
        }
    } else {
        if (isCurrentlyViolating) {
            setIsCurrentlyViolating(false);
            console.log("Violation period ended. System reset.");
        }
    }
}, [isCurrentlyViolating, navigate]); // Add dependencies for useCallback

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--white)" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "var(--deep-blue)",
          color: "var(--white)",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Online Exam</h1>
        <div className="flex gap-20">
          <div className="timer">{formatTime(timeLeft)}</div>
          <div className="recording-status">● REC</div>
          <div
            style={{
              backgroundColor: "var(--teal)",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Screen Sharing Active
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "30px" }}>
        <div className="flex-between mb-20">
          <h2>
            Question {currentQuestion + 1} of {questions.length}
          </h2>
          <div className="flex gap-10">
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === questions.length - 1}
            >
              Next
            </button>
            <button className="btn-primary" onClick={() => navigate("/submit")}>
              Submit Exam
            </button>
          </div>
        </div>

        <div className="question-area">
          <h3 style={{ marginBottom: "20px", color: "var(--deep-blue)" }}>{questions[currentQuestion].question}</h3>

          {questions[currentQuestion].type === "mcq" ? (
            <div>
              {questions[currentQuestion].options?.map((option, index) => (
                <div key={index} style={{ marginBottom: "15px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`question-${questions[currentQuestion].id}`}
                      value={option}
                      checked={answers[questions[currentQuestion].id] === option}
                      onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                      style={{ accentColor: "var(--teal)" }}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              style={{
                width: "100%",
                minHeight: "300px",
                padding: "15px",
                border: "1px solid var(--light-gray)",
                borderRadius: "6px",
                fontSize: "14px",
                resize: "vertical",
              }}
              placeholder="Type your answer here..."
              value={answers[questions[currentQuestion].id] || ""}
              onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
            />
          )}
        </div>
      </div>

      {/* Camera Feed */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <CameraFeed 
          onCheatingDetected={handleCheatingDetected}
          isActive={true}
        />
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          marginTop: '5px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          Violations: {suspiciousActivity}
        </div>
      </div>

      {/* Alert Popups */}
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          className="alert-popup"
          style={{
            top: `${20 + index * 80}px`,
            backgroundColor: alert.type === "error" ? "#FFEBEE" : "var(--light-blue)",
            borderColor: alert.type === "error" ? "var(--error-red)" : "var(--deep-blue)",
          }}
        >
          <div className="flex-between">
            <span style={{ fontWeight: "500" }}>{alert.message}</span>
            <button
              onClick={() => dismissAlert(alert.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--deep-blue)",
                fontWeight: "bold",
              }}
            >
              ×
            </button>
          </div>
          <button
            className="btn-secondary"
            style={{ marginTop: "10px", fontSize: "12px", padding: "5px 10px" }}
            onClick={() => dismissAlert(alert.id)}
          >
            Got it
          </button>
        </div>
      ))}
    </div>
  )
}

export default ExamScreen
