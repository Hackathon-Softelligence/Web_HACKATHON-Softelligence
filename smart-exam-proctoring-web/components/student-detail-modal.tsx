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
import { alertApi, StudentAlert } from "@/service/alert.service";

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

  // Fetch student alerts when modal opens
  useEffect(() => {
    const fetchStudentAlerts = async () => {
      if (!studentId || !examId || !isOpen) return;

      try {
        setLoading(true);
        setError(null);
        console.log(
          "Fetching alerts for student:",
          studentId,
          "in exam:",
          examId
        );

        const response = await alertApi.getAlertsByStudentId(examId, studentId);
        console.log("Student alerts response:", response);

        if (response.success && response.data) {
          console.log("Raw student alerts:", response.data);

          // Transform API alerts to match the existing Alert interface
          const transformedAlerts: Alert[] = response.data.map(
            (alert: StudentAlert) => {
              // Calculate severity based on alert type
              const severity = calculateSeverity(alert.type);

              // Format timestamp
              const timestamp = formatTime(new Date(alert.alertAt));

              return {
                id: alert._id,
                type: alert.type,
                description: generateDescription(alert.type),
                timestamp,
                severity,
              };
            }
          );

          console.log("Transformed alerts:", transformedAlerts);
          setAlerts(transformedAlerts);

          // Set student info from the first alert (if available)
          if (response.data.length > 0) {
            setStudentInfo({
              id: studentId,
              name: response.data[0].studentId.name,
              studentId: response.data[0].studentId._id,
              room: response.data[0].examId.name || "Online",
              riskLevel: calculateRiskLevel(transformedAlerts),
              alerts: transformedAlerts.length,
              examStartTime: "14:00:00", // This could be enhanced with real exam data
              currentTime: new Date().toLocaleTimeString(),
            });
          }
        } else {
          console.error("API Error:", response.error);
          setError(
            `API Error: ${response.error || "Failed to fetch student alerts"}`
          );
          setAlerts([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          `Network Error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAlerts();
  }, [studentId, examId, isOpen]);

  // Helper function to calculate severity based on alert type
  const calculateSeverity = (type: string): "low" | "medium" | "high" => {
    const highSeverityTypes = [
      "Face Detection",
      "Phone Usage",
      "Multiple Faces",
    ];
    const mediumSeverityTypes = ["Looking Away", "Voice Detected"];

    if (highSeverityTypes.includes(type)) return "high";
    if (mediumSeverityTypes.includes(type)) return "medium";
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

  // Helper function to generate description based on alert type
  const generateDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      "Face Detection": "Student's face not detected in camera view",
      "Phone Usage": "Mobile device detected on desk",
      "Multiple Faces": "Additional person detected in camera view",
      "Looking Away": "Student looked away from screen",
      "Voice Detected": "Voice activity detected during exam",
      "Tab Switch": "Student switched to different browser tab",
      "Suspicious Behavior": "Unusual behavior pattern detected",
    };

    return descriptions[type] || `${type} alert detected`;
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

  // Fallback student info if API data is not available
  const student = studentInfo || {
    id: studentId,
    name: "Loading...",
    studentId: studentId,
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
                      <img
                        src="/placeholder.svg?height=360&width=640"
                        alt="Student webcam feed"
                        className="w-full h-full object-cover rounded-lg"
                      />
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
                <CardTitle className="text-sm">Recent Alerts</CardTitle>
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
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {alert.description}
                      </p>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
