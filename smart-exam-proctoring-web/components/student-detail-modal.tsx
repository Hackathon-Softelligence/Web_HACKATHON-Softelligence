"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Flag,
  UserX,
  Camera,
  Monitor,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { firestoreService, DetectionLog } from "@/service/firestore.service";

interface Alert {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

interface StudentDetailModalProps {
  studentId: string | null;
  examId?: string; // Add examId prop
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailModal({
  studentId,
  examId,
  isOpen,
  onClose,
}: StudentDetailModalProps) {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("live");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [firestoreLogs, setFirestoreLogs] = useState<DetectionLog[]>([]);

  // Fetch student data from Firestore when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("=== FIRESTORE DATA FETCH START ===");
        console.log("Fetching Firestore data for document: SE123456");

        // Get logs from Firestore for document SE123456 (hardcoded)
        const logs = await firestoreService.getLogsByStudentId("SE123456");
        console.log("=== RAW FIRESTORE LOGS ===");
        console.log("Total logs found:", logs.length);
        console.log("All logs data:", JSON.stringify(logs, null, 2));

        if (logs && logs.length > 0) {
          console.log("=== PROCESSING FIRESTORE DATA ===");

          // Log each individual log
          logs.forEach((log, index) => {
            console.log(`--- Log ${index + 1} ---`);
            console.log("ID:", log.id);
            console.log("Name:", log.name);
            console.log("Student No:", log.studentNo);
            console.log("Status:", log.status);
            console.log("Image URL:", log.imageUrl);
            console.log("Timestamp type:", typeof log.timestamp);
            console.log("Timestamp value:", log.timestamp);
            console.log(
              "Timestamp instanceof Date:",
              log.timestamp instanceof Date
            );
            if (log.timestamp instanceof Date) {
              console.log(
                "Timestamp toISOString:",
                log.timestamp.toISOString()
              );
              console.log(
                "Timestamp toLocaleString:",
                log.timestamp.toLocaleString("vi-VN")
              );
            }
            console.log("Raw log object:", log);
          });

          // Transform Firestore logs to Alert format
          const transformedAlerts: Alert[] = logs.map((log) => {
            return {
              id: log.id,
              type: log.status, // Use status as alert type
              description: generateDescription(log.status),
              timestamp: safeParseTimestamp(log.timestamp),
              severity: calculateSeverity(log.status),
            };
          });

          console.log("=== TRANSFORMED ALERTS ===");
          console.log("Transformed alerts from Firestore:", transformedAlerts);
          console.log(
            "Alerts before sorting:",
            transformedAlerts.map((a) => ({
              id: a.id,
              timestamp: a.timestamp,
              timestampType: typeof a.timestamp,
              parsedDate: new Date(a.timestamp),
              isValid: !isNaN(new Date(a.timestamp).getTime()),
            }))
          );

          // Sort alerts by timestamp (newest first)
          transformedAlerts.sort((a, b) => {
            try {
              const dateA = new Date(a.timestamp);
              const dateB = new Date(b.timestamp);

              // Check if dates are valid
              if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                console.warn("Invalid timestamp found during sorting:", {
                  a: a.timestamp,
                  b: b.timestamp,
                });
                return 0; // Keep original order if invalid
              }

              return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
            } catch (error) {
              console.error("Error sorting alerts by timestamp:", error);
              return 0; // Keep original order if error
            }
          });

          console.log(
            "Alerts after sorting:",
            transformedAlerts.map((a) => ({
              id: a.id,
              timestamp: a.timestamp,
              parsedDate: new Date(a.timestamp),
            }))
          );

          setAlerts(transformedAlerts);
          setFirestoreLogs(logs);

          // Set student info from the first log
          const firstLog = logs[0];
          console.log("=== STUDENT INFO FROM FIRST LOG ===");
          console.log("First log data:", firstLog);
          console.log("Student name from log:", firstLog.name);
          console.log("Student number from log:", firstLog.studentNo);

          const studentInfoData = {
            id: "SE123456", // Hardcoded to SE123456
            name: firstLog.name,
            studentId: firstLog.studentNo,
            room: "Online", // Default room for Firestore students
            riskLevel: calculateRiskLevel(transformedAlerts),
            alerts: transformedAlerts.length,
            examStartTime: "14:00:00",
            currentTime: new Date().toLocaleTimeString(),
          };

          console.log("=== FINAL STUDENT INFO ===");
          console.log("Setting student info from Firestore:", studentInfoData);
          setStudentInfo(studentInfoData);
        } else {
          // No logs found for this student
          console.log("=== NO LOGS FOUND ===");
          console.log("No Firestore logs found for document: SE123456");

          // Use fallback data
          const fallbackStudentInfo = {
            id: "SE123456", // Hardcoded to SE123456
            name: "Student SE123456",
            studentId: "SE123456",
            room: "Online",
            riskLevel: "low" as const,
            alerts: 0,
            examStartTime: "14:00:00",
            currentTime: new Date().toLocaleTimeString(),
          };

          console.log("Using fallback student info:", fallbackStudentInfo);
          setStudentInfo(fallbackStudentInfo);
          setAlerts([]);
          setError(null);
        }

        console.log("=== FIRESTORE DATA FETCH COMPLETE ===");
      } catch (err) {
        console.error("=== FIRESTORE FETCH ERROR ===");
        console.error("Firestore fetch error:", err);
        setError(
          `Firestore Error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [isOpen]); // Remove studentId dependency, only depend on isOpen

  // Helper function to format timestamp nicely
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  // Helper function to safely parse timestamp
  const safeParseTimestamp = (timestamp: any): string => {
    try {
      console.log("Parsing timestamp:", timestamp, "Type:", typeof timestamp);

      if (timestamp instanceof Date) {
        console.log("Timestamp is Date object:", timestamp);
        return timestamp.toISOString();
      } else if (typeof timestamp === "string") {
        console.log("Timestamp is string:", timestamp);
        const parsed = new Date(timestamp);
        if (!isNaN(parsed.getTime())) {
          console.log("Successfully parsed string timestamp:", parsed);
          return parsed.toISOString();
        } else {
          console.warn("Invalid string timestamp:", timestamp);
        }
      } else if (
        timestamp &&
        typeof timestamp === "object" &&
        "toDate" in timestamp
      ) {
        // Firestore Timestamp object
        console.log("Timestamp is Firestore Timestamp object:", timestamp);
        const date = (timestamp as any).toDate();
        if (date instanceof Date) {
          console.log("Successfully converted Firestore timestamp:", date);
          return date.toISOString();
        } else {
          console.warn("Invalid Firestore timestamp conversion:", date);
        }
      } else if (
        timestamp &&
        typeof timestamp === "object" &&
        "seconds" in timestamp
      ) {
        // Firestore Timestamp with seconds/nanoseconds
        console.log("Timestamp has seconds property:", timestamp);
        const date = new Date(timestamp.seconds * 1000);
        if (!isNaN(date.getTime())) {
          console.log("Successfully converted seconds timestamp:", date);
          return date.toISOString();
        } else {
          console.warn("Invalid seconds timestamp:", timestamp);
        }
      } else {
        console.warn("Unknown timestamp format:", timestamp);
      }

      // Fallback to current time
      console.warn("Using fallback timestamp for:", timestamp);
      return new Date().toISOString();
    } catch (error) {
      console.error("Error parsing timestamp:", error, "Value:", timestamp);
      return new Date().toISOString();
    }
  };

  // Helper function to calculate severity based on status
  const calculateSeverity = (status: string): "low" | "medium" | "high" => {
    if (status.includes("lắc") || status.includes("nghiêng")) {
      return "high";
    }
    if (status.includes("nhìn") || status.includes("quay")) {
      return "medium";
    }
    return "low";
  };

  // Helper function to calculate risk level based on alerts
  const calculateRiskLevel = (alerts: Alert[]): "low" | "medium" | "high" => {
    if (alerts.length === 0) return "low";

    const highSeverityCount = alerts.filter(
      (a) => a.severity === "high"
    ).length;
    const mediumSeverityCount = alerts.filter(
      (a) => a.severity === "medium"
    ).length;

    if (highSeverityCount >= 2 || alerts.length >= 5) return "high";
    if (mediumSeverityCount >= 2 || alerts.length >= 3) return "medium";
    return "low";
  };

  // Helper function to generate description based on status
  const generateDescription = (status: string): string => {
    const descriptions: Record<string, string> = {
      "Đầu lắc qua lắc lại": "Student's head is shaking repeatedly",
      "Nhìn sang trái": "Student is looking to the left",
      "Nhìn sang phải": "Student is looking to the right",
      "Quay đầu": "Student is turning their head",
      "Nghiêng đầu": "Student is tilting their head",
    };

    return descriptions[status] || `${status} detected`;
  };

  // Helper function to format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  if (!studentId) return null;

  // Fallback student info if Firestore data is not available
  const student = studentInfo || {
    id: "SE123456", // Always use SE123456
    name: "Loading...",
    studentId: "SE123456", // Always use SE123456
    room: "Loading...",
    riskLevel: "low" as const,
    alerts: 0,
    examStartTime: "14:00:00",
    currentTime: new Date().toLocaleTimeString(),
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic here
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleFlagStudent = () => {
    // Flag student logic here
    console.log("Flagging student:", studentId);
  };

  const handleRemoveStudent = () => {
    // Remove student logic here
    console.log("Removing student:", studentId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                  {student.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-sm text-gray-500">
                  {student.studentId} • {student.room}
                </p>
              </div>
              <Badge
                className={`${
                  student.riskLevel === "high"
                    ? "bg-red-100 text-red-800"
                    : student.riskLevel === "medium"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {student.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="live"
                  className="flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Live Feed</span>
                </TabsTrigger>
                <TabsTrigger
                  value="screen"
                  className="flex items-center space-x-2"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Screen Share</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                      {firestoreLogs.length > 0 && firestoreLogs[0].imageUrl ? (
                        <img
                          src={firestoreLogs[0].imageUrl}
                          alt="Student webcam feed"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=360&width=640";
                          }}
                        />
                      ) : (
                        <img
                          src="/placeholder.svg?height=360&width=640"
                          alt="Student webcam feed"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>Webcam Feed - Live</span>
                      <span className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Recording</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="screen" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <img
                        src="/placeholder.svg?height=360&width=640"
                        alt="Student screen share"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>Screen Share - Live</span>
                      <span className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Active</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button className="flex-1" onClick={handleSendMessage}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Warning
              </Button>
              <Button variant="outline" onClick={handleFlagStudent}>
                <Flag className="w-4 h-4 mr-2" />
                Flag Student
              </Button>
              <Button variant="destructive" onClick={handleRemoveStudent}>
                <UserX className="w-4 h-4 mr-2" />
                Remove from Exam
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Exam Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span>{student.examStartTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Time:</span>
                  <span>{student.currentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>25m 30s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alerts:</span>
                  <Badge variant="destructive" className="text-xs">
                    {student.alerts}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Recent Alerts (Firestore)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">
                      Loading alerts...
                    </span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-4 text-center">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-500">{error}</span>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-4">
                    <span className="text-sm text-gray-500">
                      No alerts found
                    </span>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border-l-4 pl-3 py-2 ${
                        alert.severity === "high"
                          ? "border-red-400"
                          : alert.severity === "medium"
                          ? "border-yellow-400"
                          : "border-green-400"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            alert.severity === "high"
                              ? "text-red-700"
                              : alert.severity === "medium"
                              ? "text-yellow-700"
                              : "text-green-700"
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {alert.description}
                      </p>
                      {/* Show image if available */}
                      {firestoreLogs.find((log) => log.id === alert.id)
                        ?.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={
                              firestoreLogs.find((log) => log.id === alert.id)
                                ?.imageUrl
                            }
                            alt="Detection evidence"
                            className="w-16 h-12 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Send Message */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Send Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Type your message to the student..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === "development" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Debug Info (Firestore - SE123456)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <strong>Document ID:</strong> SE123456 (hardcoded)
                  </div>
                  <div>
                    <strong>Modal Student ID:</strong> {studentId || "None"}
                  </div>
                  <div>
                    <strong>Exam ID:</strong> {examId || "None"}
                  </div>
                  <div>
                    <strong>Firestore Logs Count:</strong>{" "}
                    {firestoreLogs.length}
                  </div>
                  <div>
                    <strong>Alerts Count:</strong> {alerts.length}
                  </div>
                  <div>
                    <strong>Loading:</strong> {loading ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Error:</strong> {error || "None"}
                  </div>
                  <div>
                    <strong>Latest Image URL:</strong>{" "}
                    {firestoreLogs[0]?.imageUrl || "None"}
                  </div>
                  <div>
                    <strong>Student Info:</strong>
                    <pre className="mt-1 text-xs bg-gray-100 p-1 rounded">
                      {JSON.stringify(studentInfo, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong>Latest Firestore Log:</strong>
                    <pre className="mt-1 text-xs bg-gray-100 p-1 rounded max-h-20 overflow-y-auto">
                      {firestoreLogs.length > 0
                        ? JSON.stringify(firestoreLogs[0], null, 2)
                        : "No logs"}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
