"use client"

import { useState } from "react"
import { Download, Play, ImageIcon, FileText, Eye, Check, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Evidence {
  id: string
  type: "image" | "video"
  studentName: string
  studentId: string
  alertType: string
  timestamp: string
  severity: "low" | "medium" | "high"
  status: "pending" | "reviewed" | "confirmed"
  description: string
  thumbnailUrl: string
  fullUrl: string
  notes?: string
}

const mockEvidence: Evidence[] = [
  {
    id: "1",
    type: "image",
    studentName: "Bob Smith",
    studentId: "ST002",
    alertType: "Person Detected",
    timestamp: "2024-01-15 14:23:45",
    severity: "high",
    status: "pending",
    description: "Additional person detected in camera view",
    thumbnailUrl: "/placeholder.svg?height=120&width=160",
    fullUrl: "/placeholder.svg?height=480&width=640",
  },
  {
    id: "2",
    type: "video",
    studentName: "Eva Brown",
    studentId: "ST005",
    alertType: "Phone Detected",
    timestamp: "2024-01-15 14:22:12",
    severity: "high",
    status: "reviewed",
    description: "Mobile device detected on desk",
    thumbnailUrl: "/placeholder.svg?height=120&width=160",
    fullUrl: "/placeholder.svg?height=480&width=640",
    notes: "Clear violation - phone visible for 30+ seconds",
  },
  {
    id: "3",
    type: "image",
    studentName: "Carol Davis",
    studentId: "ST003",
    alertType: "Looking Away",
    timestamp: "2024-01-15 14:20:33",
    severity: "medium",
    status: "confirmed",
    description: "Student looked away from screen for 20 seconds",
    thumbnailUrl: "/placeholder.svg?height=120&width=160",
    fullUrl: "/placeholder.svg?height=480&width=640",
    notes: "Confirmed violation - student was looking at notes",
  },
  {
    id: "4",
    type: "video",
    studentName: "Bob Smith",
    studentId: "ST002",
    alertType: "Suspicious Movement",
    timestamp: "2024-01-15 14:18:15",
    severity: "medium",
    status: "pending",
    description: "Unusual hand movements detected",
    thumbnailUrl: "/placeholder.svg?height=120&width=160",
    fullUrl: "/placeholder.svg?height=480&width=640",
  },
]

export function ReportsEvidence() {
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null)
  const [studentFilter, setStudentFilter] = useState("all")
  const [alertTypeFilter, setAlertTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [notes, setNotes] = useState("")

  const filteredEvidence = mockEvidence.filter((evidence) => {
    const matchesStudent = studentFilter === "all" || evidence.studentId === studentFilter
    const matchesAlertType = alertTypeFilter === "all" || evidence.alertType === alertTypeFilter
    const matchesStatus = statusFilter === "all" || evidence.status === statusFilter
    return matchesStudent && matchesAlertType && matchesStatus
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
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "reviewed":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleMarkReviewed = (evidenceId: string) => {
    console.log("Marking evidence as reviewed:", evidenceId)
  }

  const handleConfirmViolation = (evidenceId: string) => {
    console.log("Confirming violation:", evidenceId)
  }

  const handleAddNotes = (evidenceId: string, notes: string) => {
    console.log("Adding notes to evidence:", evidenceId, notes)
  }

  const handleDownloadReport = (type: "individual" | "session") => {
    console.log("Downloading report:", type)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reports & Evidence Review</span>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleDownloadReport("individual")}>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="ST002">Bob Smith (ST002)</SelectItem>
                <SelectItem value="ST005">Eva Brown (ST005)</SelectItem>
                <SelectItem value="ST003">Carol Davis (ST003)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alert Types</SelectItem>
                <SelectItem value="Person Detected">Person Detected</SelectItem>
                <SelectItem value="Phone Detected">Phone Detected</SelectItem>
                <SelectItem value="Looking Away">Looking Away</SelectItem>
                <SelectItem value="Suspicious Movement">Suspicious Movement</SelectItem>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence Gallery */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEvidence.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEvidence(evidence)}
                  >
                    <div className="relative mb-3">
                      <img
                        src={evidence.thumbnailUrl || "/placeholder.svg"}
                        alt={`Evidence ${evidence.id}`}
                        className="w-full h-24 object-cover rounded"
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
                        <Badge className={`text-xs ${getSeverityColor(evidence.severity)}`}>
                          {evidence.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm text-exam-primary">{evidence.alertType}</h4>
                        <Badge className={`text-xs ${getStatusColor(evidence.status)}`}>
                          {evidence.status.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600">{evidence.description}</p>

                      <div className="text-xs text-gray-500">
                        <p className="font-medium">{evidence.studentName}</p>
                        <p>
                          {evidence.studentId} • {new Date(evidence.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="space-y-4">
                  {/* Media Preview */}
                  <div className="relative">
                    <img
                      src={selectedEvidence.fullUrl || "/placeholder.svg"}
                      alt={`Evidence ${selectedEvidence.id}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {selectedEvidence.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="rounded-full">
                          <Play className="w-6 h-6" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Evidence Details */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-exam-primary">{selectedEvidence.alertType}</h3>
                      <p className="text-sm text-gray-600">{selectedEvidence.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Student:</span>
                        <p className="font-medium">{selectedEvidence.studentName}</p>
                        <p className="text-gray-500">{selectedEvidence.studentId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Timestamp:</span>
                        <p className="font-medium">{new Date(selectedEvidence.timestamp).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Badge className={`${getSeverityColor(selectedEvidence.severity)}`}>
                        {selectedEvidence.severity.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(selectedEvidence.status)}`}>
                        {selectedEvidence.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Notes</label>
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
                        <Button className="w-full" onClick={() => handleMarkReviewed(selectedEvidence.id)}>
                          <Check className="w-4 h-4 mr-2" />
                          Mark as Reviewed
                        </Button>
                      )}

                      {selectedEvidence.status !== "confirmed" && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleConfirmViolation(selectedEvidence.id)}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Confirm Violation
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleAddNotes(selectedEvidence.id, notes)}
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
    </div>
  )
}
