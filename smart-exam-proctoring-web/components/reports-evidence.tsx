"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Play,
  ImageIcon,
  FileText,
  Eye,
  Check,
  Flag,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { alertApi } from "@/service/alert.service";
import { examApi } from "@/service/exam.service";

interface Evidence {
  id: string;
  type: "image" | "video";
  studentName: string;
  studentId: string;
  alertType: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "reviewed" | "confirmed";
  description: string;
  thumbnailUrl: string;
  fullUrl: string;
  notes?: string;
  studentInfo?: any;
  alertInfo?: any;
}

interface Exam {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  room: string;
}

interface Alert {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    avatar: string;
    __v: number;
  };
  examId: string;
  alertAt: string;
  recording: string;
  __v: number;
}

interface ReportsEvidenceProps {
  examId?: string;
}

export function ReportsEvidence({ examId: propExamId }: ReportsEvidenceProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
    null
  );
  const [studentFilter, setStudentFilter] = useState("all");
  const [alertTypeFilter, setAlertTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<string[]>([]);
  const [alertTypes, setAlertTypes] = useState<string[]>([]);

  // Exam selection state
  const [selectedExamId, setSelectedExamId] = useState<string>(
    propExamId || ""
  );
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Fetch exams for select dropdown
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoadingExams(true);
        console.log("Fetching exams for select dropdown...");

        const response = await examApi.getList();
        console.log("Exams API response:", response);

        if (response.success && response.data) {
          console.log("Raw exams data:", response.data);

          // Handle different possible response structures
          let examArray: any[] = [];

          if (response.data.exams && Array.isArray(response.data.exams)) {
            examArray = response.data.exams;
          } else if (Array.isArray(response.data)) {
            examArray = response.data;
          } else if (
            typeof response.data === "object" &&
            response.data !== null &&
            "data" in response.data &&
            Array.isArray((response.data as any).data)
          ) {
            examArray = (response.data as any).data;
          } else {
            console.error("Unexpected API response structure:", response.data);
            setError("Unexpected API response structure");
            return;
          }

          const transformedExams: Exam[] = examArray.map((exam: any) => ({
            _id: exam._id || exam.id,
            name: exam.name || exam.title,
            startTime: exam.startTime,
            endTime: exam.endTime,
            status: exam.status,
            room: exam.room || exam.subject || "N/A",
          }));

          console.log("Transformed exams:", transformedExams);
          setExams(transformedExams);
        } else {
          console.error("API Error:", response.error);
          setError(`API Error: ${response.error || "Failed to fetch exams"}`);
        }
      } catch (err) {
        console.error("Fetch exams error:", err);
        setError(
          `Network Error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, []);

  // Fetch alerts when exam is selected
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!selectedExamId) {
        setAlerts([]);
        setEvidence([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching alerts for exam:", selectedExamId);

        const response = await alertApi.getAlertsByExamId(selectedExamId);
        console.log("Alerts API response:", response);

        if (response.success && response.data) {
          console.log("Raw alerts data:", response.data);

          // Handle different possible response structures
          let alertArray: any[] = [];

          if (Array.isArray(response.data)) {
            alertArray = response.data;
          } else if (
            response.data.alerts &&
            Array.isArray(response.data.alerts)
          ) {
            alertArray = response.data.alerts;
          } else if (
            typeof response.data === "object" &&
            response.data !== null &&
            "data" in response.data &&
            Array.isArray((response.data as any).data)
          ) {
            alertArray = (response.data as any).data;
          } else {
            console.error(
              "Unexpected alerts response structure:",
              response.data
            );
            setError("Unexpected alerts response structure");
            return;
          }

          console.log("Alert array:", alertArray);
          setAlerts(alertArray);

          // Transform alerts to evidence format
          const transformedEvidence: Evidence[] = alertArray.map(
            (alert: Alert) => ({
              id: alert._id,
              type:
                alert.recording.includes("video") ||
                alert.recording.includes("mp4")
                  ? "video"
                  : "image",
              studentName: alert.studentId.name,
              studentId: alert.studentId._id,
              alertType: "Alert", // Default alert type since it's not in the API response
              timestamp: alert.alertAt,
              severity: "medium", // Default severity
              status: "pending", // Default status
              description: `Alert for ${alert.studentId.name}`,
              thumbnailUrl: alert.recording,
              fullUrl: alert.recording,
              notes: "",
              studentInfo: alert.studentId,
              alertInfo: alert,
            })
          );

          console.log("Transformed evidence:", transformedEvidence);
          setEvidence(transformedEvidence);

          // Extract unique students and alert types for filters
          const uniqueStudents = [
            ...new Set(transformedEvidence.map((e) => e.studentId)),
          ];
          const uniqueAlertTypes = [
            ...new Set(transformedEvidence.map((e) => e.alertType)),
          ];

          setStudents(uniqueStudents);
          setAlertTypes(uniqueAlertTypes);
        } else {
          console.error("API Error:", response.error);
          setError(`API Error: ${response.error || "Failed to fetch alerts"}`);
          setAlerts([]);
          setEvidence([]);
        }
      } catch (err) {
        console.error("Fetch alerts error:", err);
        setError(
          `Network Error: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        setAlerts([]);
        setEvidence([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [selectedExamId]);

  const filteredEvidence = evidence.filter((evidence) => {
    const matchesStudent =
      studentFilter === "all" || evidence.studentId === studentFilter;
    const matchesAlertType =
      alertTypeFilter === "all" || evidence.alertType === alertTypeFilter;
    const matchesStatus =
      statusFilter === "all" || evidence.status === statusFilter;
    return matchesStudent && matchesAlertType && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "reviewed":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkReviewed = (evidenceId: string) => {
    console.log("Marking evidence as reviewed:", evidenceId);
    // TODO: Implement API call to update evidence status
  };

  const handleConfirmViolation = (evidenceId: string) => {
    console.log("Confirming violation:", evidenceId);
    // TODO: Implement API call to confirm violation
  };

  const handleAddNotes = (evidenceId: string, notes: string) => {
    console.log("Adding notes to evidence:", evidenceId, notes);
    // TODO: Implement API call to add notes
  };

  const handleDownloadReport = (type: "individual" | "session") => {
    console.log("Downloading report:", type);
    // TODO: Implement report download functionality
  };

  const handleDownloadRecording = (
    recordingUrl: string,
    studentName: string
  ) => {
    console.log("Downloading recording for:", studentName, recordingUrl);
    window.open(recordingUrl, "_blank");
  };

  const handleViewRecording = (recordingUrl: string, studentName: string) => {
    console.log("Viewing recording for:", studentName, recordingUrl);
    window.open(recordingUrl, "_blank");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loadingExams) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading exams...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !selectedExamId) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Exams
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Exam Select */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reports & Evidence Review</span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleDownloadReport("individual")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Individual Reports
              </Button>
              <Button onClick={() => handleDownloadReport("session")}>
                <Download className="w-4 h-4 mr-2" />
                Download Session Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam to view alerts and evidence" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name} - {exam.room} ({exam.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedExamId && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {alerts.length} alerts found
              </Badge>
            )}
          </div>

          {selectedExamId && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map((studentId) => {
                    const studentEvidence = evidence.find(
                      (e) => e.studentId === studentId
                    );
                    return (
                      <SelectItem key={studentId} value={studentId}>
                        {studentEvidence?.studentName || studentId} ({studentId}
                        )
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select
                value={alertTypeFilter}
                onValueChange={setAlertTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by alert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alert Types</SelectItem>
                  {alertTypes.map((alertType) => (
                    <SelectItem key={alertType} value={alertType}>
                      {alertType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="confirmed">Confirmed Violation</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 flex items-center">
                <span>{filteredEvidence.length} evidence items</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedExamId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evidence Gallery */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Evidence Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading alerts...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Error Loading Alerts
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => setSelectedExamId(selectedExamId)}>
                      Try Again
                    </Button>
                  </div>
                ) : evidence.length === 0 ? (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No evidence found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredEvidence.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedEvidence(evidence)}
                      >
                        <div className="relative mb-3">
                          <img
                            src="https://images.icon-icons.com/1223/PNG/512/1492617371-15-youtube-video-player-play-logo-media_83436.png"
                            // alt={`Evidence ${evidence.id}`}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <div className="absolute top-2 left-2">
                            {evidence.type === "video" ? (
                              <div className="bg-black bg-opacity-75 rounded-full p-1">
                                <Play className="w-3 h-3 text-white" />
                              </div>
                            ) : (
                              <div className="bg-black bg-opacity-75 rounded-full p-1">
                                <ImageIcon className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge
                              className={`text-xs ${getSeverityColor(
                                evidence.severity
                              )}`}
                            >
                              {evidence.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-exam-primary">
                              {evidence.alertType}
                            </h4>
                            <Badge
                              className={`text-xs ${getStatusColor(
                                evidence.status
                              )}`}
                            >
                              {evidence.status.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-xs text-gray-600">
                            {evidence.description}
                          </p>

                          <div className="text-xs text-gray-500">
                            <p className="font-medium">
                              {evidence.studentName}
                            </p>
                            <p> {formatDateTime(evidence.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Evidence Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvidence ? (
                  <div className="space-y-6">
                    {/* Media Preview */}
                    <div className="relative">
                      {/* <img
                        src="https://images.icon-icons.com/1223/PNG/512/1492617371-15-youtube-video-player-play-logo-media_83436.png"
                        className="w-24 h-24 object-cover rounded-lg"
                      /> */}
                      {selectedEvidence.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center mb-3">
                          <Button size="lg" className="rounded-full">
                            <Play className="w-6 h-6" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Evidence Details */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-exam-primary">
                          {selectedEvidence.alertType}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedEvidence.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Student:</span>
                          <p className="font-medium">
                            {selectedEvidence.studentName}
                          </p>
                          {/* <p className="text-gray-500">
                            {selectedEvidence.studentId}
                          </p> */}
                        </div>
                        <div>
                          <span className="text-gray-600">Timestamp:</span>
                          <p className="font-medium">
                            {formatDateTime(selectedEvidence.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Badge
                          className={`${getSeverityColor(
                            selectedEvidence.severity
                          )}`}
                        >
                          {selectedEvidence.severity.toUpperCase()}
                        </Badge>
                        <Badge
                          className={`${getStatusColor(
                            selectedEvidence.status
                          )}`}
                        >
                          {selectedEvidence.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleViewRecording(
                              selectedEvidence.fullUrl,
                              selectedEvidence.studentName
                            )
                          }
                        >
                          <Play className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadRecording(
                              selectedEvidence.fullUrl,
                              selectedEvidence.studentName
                            )
                          }
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>

                      {/* Notes Section */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <Textarea
                          value={notes || selectedEvidence.notes || ""}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes about this evidence..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {selectedEvidence.status === "pending" && (
                          <Button
                            className="w-full"
                            onClick={() =>
                              handleMarkReviewed(selectedEvidence.id)
                            }
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Reviewed
                          </Button>
                        )}

                        {selectedEvidence.status !== "confirmed" && (
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() =>
                              handleConfirmViolation(selectedEvidence.id)
                            }
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Confirm Violation
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() =>
                            handleAddNotes(selectedEvidence.id, notes)
                          }
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select an evidence item to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
