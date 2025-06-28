"use client"

import { useState } from "react"
import { Search, Filter, Eye, AlertTriangle, Clock, Users, Play, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Exam {
  id: string
  name: string
  startTime: string
  endTime: string
  candidates: number
  status: "ongoing" | "upcoming" | "finished"
  alerts: number
  room: string
}

const mockExams: Exam[] = [
  {
    id: "1",
    name: "Mathematics Final Exam",
    startTime: "2024-01-15 09:00",
    endTime: "2024-01-15 12:00",
    candidates: 45,
    status: "ongoing",
    alerts: 3,
    room: "Room A",
  },
  {
    id: "2",
    name: "Computer Science Midterm",
    startTime: "2024-01-15 14:00",
    endTime: "2024-01-15 16:30",
    candidates: 32,
    status: "upcoming",
    alerts: 0,
    room: "Room B",
  },
  {
    id: "3",
    name: "Physics Lab Assessment",
    startTime: "2024-01-14 10:00",
    endTime: "2024-01-14 13:00",
    candidates: 28,
    status: "finished",
    alerts: 1,
    room: "Room C",
  },
  {
    id: "4",
    name: "English Literature Essay",
    startTime: "2024-01-15 11:00",
    endTime: "2024-01-15 14:00",
    candidates: 38,
    status: "ongoing",
    alerts: 7,
    room: "Room A",
  },
]

interface ExamDashboardProps {
  onViewMonitoring: (examId: string) => void
}

export function ExamDashboard({ onViewMonitoring }: ExamDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || exam.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "finished":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Play className="w-4 h-4" />
      case "upcoming":
        return <Clock className="w-4 h-4" />
      case "finished":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Exams</p>
                <p className="text-2xl font-bold text-exam-primary">
                  {mockExams.filter((e) => e.status === "ongoing").length}
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
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-exam-primary">
                  {mockExams.reduce((sum, exam) => sum + exam.candidates, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-exam-medium" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockExams.filter((e) => e.status === "ongoing").reduce((sum, exam) => sum + exam.alerts, 0)}
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
                <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
                <p className="text-2xl font-bold text-exam-primary">
                  {mockExams.filter((e) => e.status === "upcoming").length}
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
              <div key={exam.id} className="border border-exam-gray rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-exam-primary">{exam.name}</h3>
                      <Badge className={`${getStatusColor(exam.status)} flex items-center space-x-1`}>
                        {getStatusIcon(exam.status)}
                        <span className="capitalize">{exam.status}</span>
                      </Badge>
                      {exam.alerts > 0 && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{exam.alerts} alerts</span>
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{exam.startTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{exam.candidates} candidates</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{exam.room}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Ends: {exam.endTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewMonitoring(exam.id)}
                      disabled={exam.status === "finished"}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {exam.status === "ongoing" ? "Monitor Live" : "View Details"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
