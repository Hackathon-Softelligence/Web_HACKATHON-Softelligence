"use client"

import { useState } from "react"
import { AlertTriangle, Clock, Eye, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Alert {
  id: string
  studentName: string
  studentId: string
  type: string
  description: string
  timestamp: string
  severity: "low" | "medium" | "high"
  status: "new" | "reviewed" | "resolved"
  room: string
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    studentName: "Bob Smith",
    studentId: "ST002",
    type: "Person Detected",
    description: "Additional person detected in camera view",
    timestamp: "2024-01-15 14:23:45",
    severity: "high",
    status: "new",
    room: "Room A",
  },
  {
    id: "2",
    studentName: "Eva Brown",
    studentId: "ST005",
    type: "Phone Detected",
    description: "Mobile device detected on desk",
    timestamp: "2024-01-15 14:22:12",
    severity: "high",
    status: "new",
    room: "Room A",
  },
  {
    id: "3",
    studentName: "Carol Davis",
    studentId: "ST003",
    type: "Looking Away",
    description: "Student looked away from screen for 20 seconds",
    timestamp: "2024-01-15 14:20:33",
    severity: "medium",
    status: "reviewed",
    room: "Room A",
  },
  {
    id: "4",
    studentName: "Bob Smith",
    studentId: "ST002",
    type: "Suspicious Movement",
    description: "Unusual hand movements detected",
    timestamp: "2024-01-15 14:18:15",
    severity: "medium",
    status: "reviewed",
    room: "Room A",
  },
  {
    id: "5",
    studentName: "Eva Brown",
    studentId: "ST005",
    type: "Audio Anomaly",
    description: "Background noise detected",
    timestamp: "2024-01-15 14:15:42",
    severity: "low",
    status: "resolved",
    room: "Room A",
  },
]

export function AlertsPanel() {
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")

  const filteredAlerts = mockAlerts
    .filter((alert) => {
      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter
      return matchesSeverity && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "timestamp") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      } else if (sortBy === "severity") {
        const severityOrder = { high: 3, medium: 2, low: 1 }
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      return 0
    })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleMarkReviewed = (alertId: string) => {
    console.log("Marking alert as reviewed:", alertId)
  }

  const handleViewStudent = (studentId: string) => {
    console.log("Viewing student:", studentId)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Real-time Alerts</span>
          </div>
          <Badge variant="destructive">{filteredAlerts.filter((a) => a.status === "new").length} New</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Time</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(alert.status)}`}>{alert.status.toUpperCase()}</Badge>
                    </div>
                    <h4 className="font-medium text-sm text-exam-primary">{alert.type}</h4>
                    <p className="text-xs text-gray-600 mb-1">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="font-medium">{alert.studentName}</span>
                      <span>{alert.studentId}</span>
                      <span>{alert.room}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2 bg-transparent"
                      onClick={() => handleViewStudent(alert.studentId)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    {alert.status === "new" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6 px-2 bg-transparent"
                        onClick={() => handleMarkReviewed(alert.id)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
