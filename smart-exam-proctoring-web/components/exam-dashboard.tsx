"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Clock,
  Users,
  Play,
  CheckCircle,
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
import { examApi } from "@/service/exam.service";
import { FirebaseTest } from "@/components/firebase-test";

// Interface cho dữ liệu API thực tế
interface ExamData {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  candidates: string[];
  status: "ongoing" | "upcoming" | "finished";
  room: string;
  __v: number;
}

interface ExamDashboardProps {
  onViewMonitoring: (examId: string) => void;
}

export function ExamDashboard({ onViewMonitoring }: ExamDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exams, setExams] = useState<ExamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exams from API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching exams from API...");
        console.log(
          "API Base URL:",
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api"
        );

        // Test direct API call
        try {
          const testResponse = await fetch("http://localhost:8085/api/exams");
          console.log("Direct API test response status:", testResponse.status);
          console.log("Direct API test response:", await testResponse.text());
        } catch (testErr) {
          console.error("Direct API test failed:", testErr);
        }

        const response = await examApi.getList();
        console.log("API Response:", response);

        if (response.success && response.data) {
          console.log("Raw API data:", response.data);
          console.log("Response data type:", typeof response.data);
          console.log("Is array:", Array.isArray(response.data));
          console.log("Response data keys:", Object.keys(response.data));

          // Handle different possible response structures
          let examArray: any[] = [];

          if (response.data.exams && Array.isArray(response.data.exams)) {
            // Expected structure: { exams: [...] }
            console.log("Using exams property from response");
            examArray = response.data.exams;
          } else if (Array.isArray(response.data)) {
            // Direct array response
            console.log("Using direct array response");
            examArray = response.data;
          } else if (
            typeof response.data === "object" &&
            response.data !== null &&
            "data" in response.data &&
            Array.isArray((response.data as any).data)
          ) {
            // Nested data structure: { data: [...] }
            console.log("Using nested data property");
            examArray = (response.data as any).data;
          } else {
            console.error("Unexpected API response structure:", response.data);
            console.error(
              "Response data structure:",
              JSON.stringify(response.data, null, 2)
            );
            setError("Unexpected API response structure");
            return;
          }

          console.log("Extracted exam array:", examArray);

          if (!examArray || examArray.length === 0) {
            console.log("No exams found in response");
            setExams([]);
            return;
          }

          // Chuyển đổi dữ liệu từ ExamWithStats sang ExamData
          const examData: ExamData[] = examArray.map((exam: any) => ({
            _id: exam._id || exam.id,
            name: exam.name || exam.title,
            startTime: exam.startTime,
            endTime: exam.endTime,
            candidates: exam.candidates || [],
            status: exam.status,
            room: exam.room || exam.subject || "N/A",
            __v: exam.__v || 0,
          }));
          console.log("Transformed exam data:", examData);
          setExams(examData);
        } else {
          console.error("API Error:", response.error);
          setError(`API Error: ${response.error || "Failed to fetch exams"}`);
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

    fetchExams();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "finished":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Play className="w-4 h-4" />;
      case "upcoming":
        return <Clock className="w-4 h-4" />;
      case "finished":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Exams
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      "http://localhost:8085/api/exams"
                    );
                    console.log("Test API Status:", response.status);
                    const text = await response.text();
                    console.log("Test API Response:", text);
                    alert(`Status: ${response.status}\nResponse: ${text}`);
                  } catch (err) {
                    console.error("Test failed:", err);
                    alert(`Test failed: ${err}`);
                  }
                }}
              >
                Test API Directly
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Exams
                </p>
                <p className="text-2xl font-bold text-exam-primary">
                  {exams.filter((e) => e.status === "ongoing").length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Candidates
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {exams.reduce((sum, exam) => sum + exam.candidates.length, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {exams
                    .filter((e) => e.status === "ongoing")
                    .reduce((sum, exam) => sum + exam.candidates.length, 0)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Upcoming Exams
                </p>
                <p className="text-2xl font-bold text-exam-primary">
                  {exams.filter((e) => e.status === "upcoming").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-exam-teal" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exam List */}
          <div className="space-y-4">
            {filteredExams.map((exam) => (
              <div
                key={exam._id}
                className="border border-exam-gray rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-exam-primary">
                        {exam.name}
                      </h3>
                      <Badge
                        className={`${getStatusColor(
                          exam.status
                        )} flex items-center space-x-1`}
                      >
                        {getStatusIcon(exam.status)}
                        <span className="capitalize">{exam.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(exam.startTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{exam.candidates.length} candidates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {exam.room || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Ends: {formatDateTime(exam.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewMonitoring(exam._id)}
                      disabled={exam.status === "finished"}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {exam.status === "ongoing"
                        ? "Monitor Live"
                        : "View Details"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Firebase Test Component */}
      <Card>
        <CardHeader>
          <CardTitle>Firebase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <FirebaseTest />
        </CardContent>
      </Card>
    </div>
  );
}
