"use client";

import { useState, useEffect } from "react";
import {
  Search,
  AlertTriangle,
  Eye,
  MessageSquare,
  Flag,
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { alertApi, StudentWithAlerts } from "@/service/alert.service";
import {
  firestoreService,
  FirestoreStudent,
} from "@/service/firestore.service";

interface Student {
  id: string;
  name: string;
  studentId: string;
  room: string;
  riskLevel: "low" | "medium" | "high";
  alerts: number;
  lastActivity: string;
  webcamStatus: "active" | "inactive";
  screenShareStatus: "active" | "inactive";
  source: "api" | "firestore";
}

interface LiveMonitoringProps {
  examId: string;
  onStudentSelect: (studentId: string) => void;
}

export function LiveMonitoring({
  examId,
  onStudentSelect,
}: LiveMonitoringProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [firestoreStudents, setFirestoreStudents] = useState<
    FirestoreStudent[]
  >([]);
  const [apiStudents, setApiStudents] = useState<Student[]>([]);

  // Fetch students with alerts from API
  useEffect(() => {
    const fetchStudentsWithAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching students with alerts for exam:", examId);

        const response = await alertApi.getAllAlertByExamId(examId);
        console.log("API Response:", response);

        if (response.success && response.data) {
          console.log("Raw API data:", response.data);

          const data = response.data;

          // Set exam info
          setExamInfo(data.exam);

          // Transform API data to match the existing Student interface
          const transformedStudents: Student[] = data.students.map(
            (student: StudentWithAlerts) => {
              // Calculate risk level based on alert count and types
              const riskLevel = calculateRiskLevel(
                student.alerts,
                student.alertStatistics
              );

              // Get last activity from most recent alert
              const lastActivity =
                student.alerts.length > 0
                  ? formatTimeAgo(new Date(student.alerts[0].alertAt))
                  : "No activity";

              return {
                id: student._id,
                name: student.name,
                studentId: student._id, // Using _id as studentId for now
                room: data.exam?.room || "Online",
                riskLevel,
                alerts: student.totalAlerts,
                lastActivity,
                webcamStatus: "active", // Default to active, could be enhanced with real data
                screenShareStatus: student.hasSubmitted ? "active" : "inactive",
                source: "api" as const,
              };
            }
          );

          console.log("Transformed students:", transformedStudents);
          setApiStudents(transformedStudents);
        } else {
          console.error("API Error:", response.error);
          setError(
            `API Error: ${response.error || "Failed to fetch students"}`
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          `Network Error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchStudentsWithAlerts();
    }
  }, [examId]);

  // Subscribe to Firestore students
  useEffect(() => {
    console.log(
      "Setting up Firestore realtime subscription for live monitoring..."
    );

    const unsubscribe = firestoreService.subscribeToStudents(
      (updatedFirestoreStudents) => {
        console.log(
          "Received Firestore students update:",
          updatedFirestoreStudents
        );
        setFirestoreStudents(updatedFirestoreStudents);
      }
    );

    return () => {
      console.log("Cleaning up Firestore subscription in live monitoring");
      unsubscribe();
    };
  }, []);

  // Combine API students and Firestore students
  useEffect(() => {
    const combinedStudents: Student[] = [...apiStudents];

    // Add Firestore students
    firestoreStudents.forEach((firestoreStudent) => {
      const existingStudent = combinedStudents.find(
        (s) => s.id === firestoreStudent.id
      );
      if (!existingStudent) {
        combinedStudents.push({
          id: firestoreStudent.id,
          name: firestoreStudent.name,
          studentId: firestoreStudent.studentNo,
          room: "Online",
          riskLevel: calculateRiskLevelFromStatus(firestoreStudent.status),
          alerts: 1, // Firestore students have alerts by default
          lastActivity: formatTimeAgo(firestoreStudent.timestamp),
          webcamStatus: "active",
          screenShareStatus: "active",
          source: "firestore" as const,
        });
      }
    });

    setStudents(combinedStudents);
  }, [firestoreStudents, apiStudents]);

  // Helper function to calculate risk level from Firestore status
  const calculateRiskLevelFromStatus = (
    status: string
  ): "low" | "medium" | "high" => {
    if (status.includes("lắc") || status.includes("nghiêng")) {
      return "high";
    }
    if (status.includes("nhìn") || status.includes("quay")) {
      return "medium";
    }
    return "low";
  };

  // Helper function to calculate risk level
  const calculateRiskLevel = (
    alerts: any[],
    statistics: any
  ): "low" | "medium" | "high" => {
    if (alerts.length === 0) return "low";

    const totalAlerts = statistics.total;
    const hasHighSeverityAlerts = alerts.some(
      (alert: any) =>
        alert.type === "Face Detection" || alert.type === "Phone Usage"
    );

    if (totalAlerts >= 5 || hasHighSeverityAlerts) return "high";
    if (totalAlerts >= 2) return "medium";
    return "low";
  };

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const handleAddTestFirestoreStudent = async () => {
    try {
      const testStudent = {
        imageUrl: "",
        name: "Nguyễn Văn An",
        status: "Đầu lắc qua lắc lại",
        studentNo: "SE123456",
        timestamp: new Date(),
      };

      const newId = await firestoreService.addStudent(testStudent);
      console.log("Added test Firestore student with ID:", newId);
    } catch (err) {
      console.error("Error adding test Firestore student:", err);
      setError(
        `Error adding test student: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      riskFilter === "all" || student.riskLevel === riskFilter;
    const matchesRoom = roomFilter === "all" || student.room === roomFilter;
    return matchesSearch && matchesRisk && matchesRoom;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskBorderColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "border-green-300";
      case "medium":
        return "border-yellow-300";
      case "high":
        return "border-red-300";
      default:
        return "border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading students...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Students
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleAddTestFirestoreStudent}>
                Add Test Firestore Student
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Student Monitoring</span>
            <div className="flex items-center space-x-2">
              {examInfo && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {examInfo.name}
                </Badge>
              )}
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {filteredStudents.length} Students Active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTestFirestoreStudent}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Firestore Student
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Room A">Room A</SelectItem>
                <SelectItem value="Room B">Room B</SelectItem>
                <SelectItem value="Room C">Room C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student) => (
          <Card
            key={student.id}
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${getRiskBorderColor(
              student.riskLevel
            )}`}
            onClick={() => onStudentSelect(student.id)}
          >
            <CardContent className="p-2">
              {/* Student Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback>
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-exam-primary">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500">{student.studentId}</p>
                    {student.source === "firestore" && (
                      <Badge
                        variant="outline"
                        className="text-xs mt-1 bg-blue-50 text-blue-700"
                      >
                        Firestore
                      </Badge>
                    )}
                  </div>
                </div>
                {student.alerts > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {student.alerts}
                  </Badge>
                )}
              </div>

              {/* Video Thumbnail */}
              <div className="relative mb-3">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  {student.webcamStatus === "active" ? (
                    <img
                      src="/placeholder.svg?height=120&width=160"
                      alt={`${student.name} webcam`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-white text-xs">Camera Offline</div>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      student.webcamStatus === "active"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      student.screenShareStatus === "active"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Risk Level and Status */}
              <div className="flex items-center justify-between mb-3">
                <Badge className={`text-xs ${getRiskColor(student.riskLevel)}`}>
                  {student.riskLevel.toUpperCase()} RISK
                </Badge>
                <span className="text-xs text-gray-500">
                  {student.lastActivity}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs bg-transparent"
                >
                  <MessageSquare className="w-2 h-2 mr-0" />
                  Warn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-transparent"
                >
                  <Flag className="w-2 h-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
