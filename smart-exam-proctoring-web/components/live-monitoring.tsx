"use client";

import { useState } from "react";
import { Search, AlertTriangle, Eye, MessageSquare, Flag } from "lucide-react";
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
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    studentId: "ST001",
    room: "Room A",
    riskLevel: "low",
    alerts: 0,
    lastActivity: "2 min ago",
    webcamStatus: "active",
    screenShareStatus: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    studentId: "ST002",
    room: "Room A",
    riskLevel: "high",
    alerts: 3,
    lastActivity: "30 sec ago",
    webcamStatus: "active",
    screenShareStatus: "active",
  },
  {
    id: "3",
    name: "Carol Davis",
    studentId: "ST003",
    room: "Room A",
    riskLevel: "medium",
    alerts: 1,
    lastActivity: "1 min ago",
    webcamStatus: "active",
    screenShareStatus: "inactive",
  },
  {
    id: "4",
    name: "David Wilson",
    studentId: "ST004",
    room: "Room A",
    riskLevel: "low",
    alerts: 0,
    lastActivity: "45 sec ago",
    webcamStatus: "active",
    screenShareStatus: "active",
  },
  {
    id: "5",
    name: "Eva Brown",
    studentId: "ST005",
    room: "Room A",
    riskLevel: "medium",
    alerts: 2,
    lastActivity: "1 min ago",
    webcamStatus: "active",
    screenShareStatus: "active",
  },
  {
    id: "6",
    name: "Frank Miller",
    studentId: "ST006",
    room: "Room A",
    riskLevel: "low",
    alerts: 0,
    lastActivity: "3 min ago",
    webcamStatus: "active",
    screenShareStatus: "active",
  },
];

interface LiveMonitoringProps {
  onStudentSelect: (studentId: string) => void;
}

export function LiveMonitoring({ onStudentSelect }: LiveMonitoringProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");

  const filteredStudents = mockStudents.filter((student) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Student Monitoring</span>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {filteredStudents.length} Students Active
            </Badge>
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
            <CardContent className="p-4">
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
                {/* <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs bg-transparent"
                >
                  <Eye className="w-1 h-1 mr-0" />
                  View
                </Button> */}
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
