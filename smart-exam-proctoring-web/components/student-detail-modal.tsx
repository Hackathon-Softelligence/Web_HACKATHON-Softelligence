"use client"

import { useState } from "react"
import { MessageSquare, Flag, UserX, Camera, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Alert {
  id: string
  type: string
  description: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

interface StudentDetailModalProps {
  studentId: string | null
  isOpen: boolean
  onClose: () => void
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "Looking Away",
    description: "Student looked away from screen for 15 seconds",
    timestamp: "14:23:45",
    severity: "medium",
  },
  {
    id: "2",
    type: "Person Detected",
    description: "Additional person detected in camera view",
    timestamp: "14:20:12",
    severity: "high",
  },
  {
    id: "3",
    type: "Phone Detected",
    description: "Mobile device detected on desk",
    timestamp: "14:18:33",
    severity: "high",
  },
]

export function StudentDetailModal({ studentId, isOpen, onClose }: StudentDetailModalProps) {
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("live")

  if (!studentId) return null

  const student = {
    id: studentId,
    name: "Bob Smith",
    studentId: "ST002",
    room: "Room A",
    riskLevel: "high" as const,
    alerts: 3,
    examStartTime: "14:00:00",
    currentTime: "14:25:30",
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      // Send message logic here
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleFlagStudent = () => {
    // Flag student logic here
    console.log("Flagging student:", studentId)
  }

  const handleRemoveStudent = () => {
    // Remove student logic here
    console.log("Removing student:", studentId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
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
                className={`${student.riskLevel === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {student.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="live" className="flex items-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Live Feed</span>
                </TabsTrigger>
                <TabsTrigger value="screen" className="flex items-center space-x-2">
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
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="border-l-4 border-red-400 pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-700">{alert.type}</span>
                      <span className="text-xs text-gray-500">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                  </div>
                ))}
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
                <Button size="sm" className="w-full" onClick={handleSendMessage} disabled={!message.trim()}>
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
