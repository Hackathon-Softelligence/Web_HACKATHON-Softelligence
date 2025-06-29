"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { firestoreService, DetectionLog } from "@/service/firestore.service";
import { Loader2, CheckCircle, XCircle, Database, User } from "lucide-react";

export function FirebaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [logs, setLogs] = useState<DetectionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setConnectionStatus("connecting");
      setError(null);
      console.log("=== TESTING FIRESTORE CONNECTION ===");
      console.log("Database: drowsiness-detection");
      console.log("Student ID: SE123456");

      // Test connection by fetching logs
      const testLogs = await firestoreService.getLogsByStudentId("SE123456");

      console.log("=== CONNECTION TEST RESULT ===");
      console.log("Connection successful!");
      console.log("Logs found:", testLogs.length);
      console.log("All logs:", testLogs);

      setLogs(testLogs);
      setConnectionStatus("connected");
    } catch (err) {
      console.error("=== CONNECTION TEST ERROR ===");
      console.error("Connection failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setConnectionStatus("error");
    }
  };

  const addTestData = async () => {
    try {
      setLoading(true);
      console.log("=== ADDING TEST DATA ===");

      const testLog: Omit<DetectionLog, "id"> = {
        imageUrl: "https://via.placeholder.com/300x200?text=Test+Image",
        name: "Nguyễn Văn An",
        status: "Đầu lắc qua lắc lại",
        studentNo: "SE123456",
        timestamp: new Date(),
      };

      const logId = await firestoreService.addLog(testLog, "SE123456");
      console.log("Test data added with ID:", logId);

      // Refresh logs
      await testConnection();
    } catch (err) {
      console.error("Error adding test data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "connecting":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      default:
        return <Database className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected to Firestore";
      case "error":
        return "Connection Failed";
      case "connecting":
        return "Connecting...";
      default:
        return "Not Connected";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Firestore Connection Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
            <Badge variant="outline">Database: drowsiness-detection</Badge>
            <Badge variant="outline">Student: SE123456</Badge>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={testConnection}
              disabled={connectionStatus === "connecting"}
            >
              {connectionStatus === "connecting" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={addTestData}
              disabled={loading || connectionStatus !== "connected"}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Test Data"
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Student SE123456 Logs ({logs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Log #{index + 1}</h4>
                    <Badge variant="outline">{log.id}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {log.name}
                    </div>
                    <div>
                      <strong>Student No:</strong> {log.studentNo}
                    </div>
                    <div>
                      <strong>Status:</strong> {log.status}
                    </div>
                    <div>
                      <strong>Timestamp:</strong>{" "}
                      {log.timestamp.toLocaleString("vi-VN")}
                    </div>
                    <div className="col-span-2">
                      <strong>Image URL:</strong> {log.imageUrl || "None"}
                    </div>
                  </div>
                  {log.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={log.imageUrl}
                        alt="Detection evidence"
                        className="w-32 h-24 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Database:</strong> drowsiness-detection
          </div>
          <div>
            <strong>Collection:</strong> detection_logs/SE123456/logs
          </div>
          <div>
            <strong>Connection Status:</strong> {connectionStatus}
          </div>
          <div>
            <strong>Logs Count:</strong> {logs.length}
          </div>
          <div>
            <strong>Error:</strong> {error || "None"}
          </div>
          <div>
            <strong>Raw Logs Data:</strong>
            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
