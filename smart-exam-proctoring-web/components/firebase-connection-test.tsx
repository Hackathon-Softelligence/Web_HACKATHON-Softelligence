"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Plus, Database } from "lucide-react";
import { firestoreService, DetectionLog } from "@/service/firestore.service";

export function FirebaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "connected" | "error"
  >("testing");
  const [testResult, setTestResult] = useState<string>("");
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [studentId, setStudentId] = useState<string>("SE123456");

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setConnectionStatus("testing");
      setTestResult("🔄 Đang kiểm tra kết nối Firebase...");

      // Test 1: Try to get logs from SE123456
      const allLogs = await firestoreService.getLogsByStudentId(studentId);
      console.log("✅ Firebase connection test - All logs:", allLogs);

      setLogs(allLogs);
      setConnectionStatus("connected");
      setTestResult(
        `✅ Kết nối Firebase thành công! Tìm thấy ${allLogs.length} logs cho student ${studentId}.`
      );
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error);
      setConnectionStatus("error");
      setTestResult(
        `❌ Kết nối Firebase thất bại: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    }
  };

  const addTestLog = async () => {
    try {
      setIsAddingLog(true);
      const testLog = {
        imageUrl: "",
        name: "Nguyễn Văn An",
        status: "Đầu lắc qua lắc lại",
        studentNo: studentId,
        timestamp: new Date(),
        // Thêm các field khác nếu cần
        confidence: 0.95,
        location: "webcam",
        severity: "high",
      };

      const newId = await firestoreService.addLog(testLog, studentId);
      console.log("✅ Added test log with ID:", newId);

      // Refresh the list
      const updatedLogs = await firestoreService.getLogsByStudentId(studentId);
      setLogs(updatedLogs);
      setTestResult(`✅ Thêm test log thành công với ID: ${newId}`);
    } catch (error) {
      console.error("❌ Error adding test log:", error);
      setTestResult(
        `❌ Lỗi thêm test log: ${
          error instanceof Error ? error.message : "Lỗi không xác định"
        }`
      );
    } finally {
      setIsAddingLog(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "testing":
        return "bg-yellow-100 text-yellow-800";
      case "connected":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Firebase & Firestore Connection Test</span>
            <Badge className={getStatusColor()}>
              {connectionStatus === "testing"
                ? "TESTING"
                : connectionStatus === "connected"
                ? "CONNECTED"
                : "ERROR"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{testResult}</p>

          <div className="flex space-x-2">
            <Button onClick={testFirebaseConnection} variant="outline">
              🔄 Test Connection
            </Button>
            <Button
              onClick={addTestLog}
              disabled={isAddingLog || connectionStatus !== "connected"}
            >
              {isAddingLog ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm Test Log
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Collection Path:</strong> detection_logs/{studentId}/logs
          </div>

          {logs.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">
                📊 Logs hiện tại cho student {studentId}:
              </h4>
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-blue-900">{log.name}</p>
                        <p className="text-sm text-gray-600">
                          🆔 Log ID: {log.id}
                        </p>
                        <p className="text-sm text-gray-600">
                          📝 Student No: {log.studentNo}
                        </p>
                        <p className="text-sm text-gray-600">
                          ⚠️ Status: {log.status}
                        </p>
                        {log.confidence && (
                          <p className="text-sm text-gray-600">
                            🎯 Confidence: {log.confidence}
                          </p>
                        )}
                        {log.severity && (
                          <p className="text-sm text-gray-600">
                            🚨 Severity: {log.severity}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        🕒 {new Date(log.timestamp).toLocaleString("vi-VN")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {connectionStatus === "error" && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">
                🔧 Troubleshooting:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Kiểm tra cấu hình Firebase trong lib/firebase.ts</li>
                <li>
                  • Đảm bảo Firestore Database đã được bật trong Firebase
                  Console
                </li>
                <li>• Kiểm tra Firestore Rules (cho phép read/write)</li>
                <li>
                  • Đảm bảo collection detection_logs/SE123456/logs tồn tại
                </li>
                <li>• Xem console log để debug chi tiết</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
