import apiClient, { ApiResponse } from "@/utils/api-client";

// Alert interface
export interface Alert {
  _id: string;
  examId: string;
  studentId: string;
  studentName?: string;
  type:
    | "suspicious_behavior"
    | "face_not_detected"
    | "multiple_faces"
    | "phone_detected"
    | "tab_switch"
    | "voice_detected"
    | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: string;
  status: "active" | "resolved" | "false_positive" | "investigating";
  evidence?: {
    screenshot?: string;
    video?: string;
    audio?: string;
    metadata?: any;
  };
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number; // 0-100
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Alert with additional data
export interface AlertWithDetails extends Alert {
  examName?: string;
  studentEmail?: string;
  reviewerName?: string;
}

// Create alert request
export interface CreateAlertRequest {
  examId: string;
  studentId: string;
  type: Alert["type"];
  severity: Alert["severity"];
  description: string;
  evidence?: Alert["evidence"];
  location?: Alert["location"];
  confidence: number;
}

// Update alert request
export interface UpdateAlertRequest {
  status?: Alert["status"];
  notes?: string;
  reviewedBy?: string;
  evidence?: Alert["evidence"];
}

// Alert list response
export interface AlertListResponse {
  alerts: AlertWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    total: number;
    active: number;
    resolved: number;
    falsePositive: number;
    investigating: number;
    bySeverity: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    byType: Record<string, number>;
  };
}

// Alert statistics
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  falsePositiveAlerts: number;
  investigatingAlerts: number;
  averageResponseTime: number;
  alertsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  alertsByType: Record<string, number>;
  alertsByHour: Record<string, number>;
}

// New interfaces for the students-with-alerts response
export interface StudentWithAlerts {
  _id: string;
  name: string;
  avatar: string;
  hasSubmitted: boolean;
  submissionId?: string;
  alerts: StudentAlert[];
  alertStatistics: {
    total: number;
    byType: Record<string, number>;
  };
  totalAlerts: number;
}

export interface StudentAlert {
  _id: string;
  type: string;
  recording?: string;
  alertAt: string;
  studentId: {
    _id: string;
    name: string;
    avatar: string;
  };
  examId: {
    _id: string;
    name: string;
    status: string;
  };
}

export interface ExamInfo {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  room: string;
}

export interface ExamStatistics {
  totalStudents: number;
  totalAlerts: number;
  submittedCount: number;
  alertTypes: Record<string, number>;
  studentsWithAlerts: number;
}

export interface StudentsWithAlertsResponse {
  exam: ExamInfo;
  students: StudentWithAlerts[];
  examStatistics: ExamStatistics;
  totalStudents: number;
  totalAlerts: number;
}

// Alert service class
class AlertService {
  private baseEndpoint = "api/alerts";

  // Get all alerts by exam ID (updated to use students-with-alerts endpoint)
  async getAllAlertByExamId(
    examId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ApiResponse<StudentsWithAlertsResponse>> {
    return apiClient.get<StudentsWithAlertsResponse>(
      `api/exams/${examId}/students-with-alerts`,
      params
    );
  }

  // Helper function to get all alerts from students-with-alerts response
  async getAllAlertsFromStudents(
    examId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ApiResponse<StudentAlert[]>> {
    const response = await this.getAllAlertByExamId(examId, params);

    if (response.success && response.data) {
      // Extract all alerts from all students
      const allAlerts: StudentAlert[] = [];
      response.data.students.forEach((student) => {
        allAlerts.push(...student.alerts);
      });

      return {
        success: true,
        data: allAlerts,
      };
    }

    return {
      success: false,
      error: response.error || "Failed to extract alerts",
    };
  }

  // Get alerts in traditional format (if the API supports it)
  async getAlertsByExamId(
    examId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ApiResponse<AlertListResponse>> {
    return apiClient.get<AlertListResponse>(
      `api/exams/${examId}/alerts`,
      params
    );
  }

  // Get all alerts (general)
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    examId?: string;
    studentId?: string;
    status?: string;
    severity?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<AlertListResponse>> {
    return apiClient.get<AlertListResponse>(this.baseEndpoint, params);
  }

  // Get alert by ID
  async getAlertById(alertId: string): Promise<ApiResponse<AlertWithDetails>> {
    return apiClient.get<AlertWithDetails>(`${this.baseEndpoint}/${alertId}`);
  }

  // Create new alert
  async createAlert(
    alertData: CreateAlertRequest
  ): Promise<ApiResponse<Alert>> {
    return apiClient.post<Alert>(this.baseEndpoint, alertData);
  }

  // Update alert
  async updateAlert(
    alertId: string,
    updateData: UpdateAlertRequest
  ): Promise<ApiResponse<Alert>> {
    return apiClient.put<Alert>(`${this.baseEndpoint}/${alertId}`, updateData);
  }

  // Delete alert
  async deleteAlert(alertId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${alertId}`);
  }

  // Resolve alert
  async resolveAlert(
    alertId: string,
    notes?: string
  ): Promise<ApiResponse<Alert>> {
    return apiClient.patch<Alert>(`${this.baseEndpoint}/${alertId}/resolve`, {
      notes,
    });
  }

  // Mark alert as false positive
  async markAsFalsePositive(
    alertId: string,
    notes?: string
  ): Promise<ApiResponse<Alert>> {
    return apiClient.patch<Alert>(
      `${this.baseEndpoint}/${alertId}/false-positive`,
      { notes }
    );
  }

  // Start investigating alert
  async startInvestigation(
    alertId: string,
    notes?: string
  ): Promise<ApiResponse<Alert>> {
    return apiClient.patch<Alert>(
      `${this.baseEndpoint}/${alertId}/investigate`,
      { notes }
    );
  }

  // Get alert statistics
  async getAlertStats(examId?: string): Promise<ApiResponse<AlertStats>> {
    const endpoint = examId
      ? `api/exams/${examId}/alerts/stats`
      : `${this.baseEndpoint}/stats`;
    return apiClient.get<AlertStats>(endpoint);
  }

  // Get alerts by student
  async getAlertsByStudent(
    studentId: string,
    params?: {
      page?: number;
      limit?: number;
      examId?: string;
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<AlertListResponse>> {
    return apiClient.get<AlertListResponse>(
      `${this.baseEndpoint}/student/${studentId}`,
      params
    );
  }

  // Get alerts by student ID in a specific exam
  async getAlertsByStudentId(
    examId: string,
    studentId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ApiResponse<StudentAlert[]>> {
    // First get all students with alerts for the exam
    const response = await this.getAllAlertByExamId(examId, params);

    if (response.success && response.data) {
      // Find the specific student
      const student = response.data.students.find((s) => s._id === studentId);

      if (student) {
        return {
          success: true,
          data: student.alerts,
        };
      } else {
        return {
          success: false,
          error: "Student not found",
        };
      }
    }

    return {
      success: false,
      error: response.error || "Failed to fetch student alerts",
    };
  }

  // Export alerts
  async exportAlerts(
    examId?: string,
    format: "csv" | "excel" = "csv",
    params?: {
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    const endpoint = examId
      ? `api/exams/${examId}/alerts/export`
      : `${this.baseEndpoint}/export`;
    return apiClient.post(endpoint, { format, ...params });
  }

  // Get real-time alerts (for live monitoring)
  async getRealTimeAlerts(examId: string): Promise<ApiResponse<Alert[]>> {
    return apiClient.get<Alert[]>(`api/exams/${examId}/alerts/realtime`);
  }

  // Acknowledge alert (mark as reviewed)
  async acknowledgeAlert(
    alertId: string,
    reviewedBy: string
  ): Promise<ApiResponse<Alert>> {
    return apiClient.patch<Alert>(
      `${this.baseEndpoint}/${alertId}/acknowledge`,
      { reviewedBy }
    );
  }

  // Get alert history
  async getAlertHistory(alertId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${this.baseEndpoint}/${alertId}/history`);
  }

  // Get all evidence from alerts for reports
  async getAllEvidenceFromAlerts(
    examId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      severity?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ApiResponse<any[]>> {
    const response = await this.getAllAlertByExamId(examId, params);

    if (response.success && response.data) {
      // Extract all evidence from all students' alerts
      const allEvidence: any[] = [];

      response.data.students.forEach((student: StudentWithAlerts) => {
        student.alerts.forEach((alert: StudentAlert) => {
          // Only include alerts that have evidence (recording)
          if (alert.recording) {
            allEvidence.push({
              id: alert._id,
              type:
                alert.type.includes("video") ||
                alert.recording.includes("video")
                  ? "video"
                  : "image",
              studentName: student.name,
              studentId: student._id,
              alertType: alert.type,
              timestamp: alert.alertAt,
              severity: this.calculateSeverityFromType(alert.type),
              status: this.getStatusFromAlert(alert),
              description: this.generateDescriptionFromType(alert.type),
              thumbnailUrl: alert.recording,
              fullUrl: alert.recording,
              notes: "",
              studentInfo: student,
              alertInfo: alert,
            });
          }
        });
      });

      return {
        success: true,
        data: allEvidence,
      };
    }

    return {
      success: false,
      error: response.error || "Failed to fetch evidence",
    };
  }

  // Helper function to calculate severity from alert type
  private calculateSeverityFromType(type: string): "low" | "medium" | "high" {
    const highSeverityTypes = [
      "Face Detection",
      "Phone Usage",
      "Multiple Faces",
    ];
    const mediumSeverityTypes = ["Looking Away", "Voice Detected"];

    if (highSeverityTypes.includes(type)) return "high";
    if (mediumSeverityTypes.includes(type)) return "medium";
    return "low";
  }

  // Helper function to get status from alert
  private getStatusFromAlert(
    alert: StudentAlert
  ): "pending" | "reviewed" | "confirmed" {
    // This could be enhanced with real status from alert data
    // For now, default to pending
    return "pending";
  }

  // Helper function to generate description from alert type
  private generateDescriptionFromType(type: string): string {
    const descriptions: Record<string, string> = {
      "Face Detection": "Student's face not detected in camera view",
      "Phone Usage": "Mobile device detected on desk",
      "Multiple Faces": "Additional person detected in camera view",
      "Looking Away": "Student looked away from screen",
      "Voice Detected": "Voice activity detected during exam",
      "Tab Switch": "Student switched to different browser tab",
      "Suspicious Behavior": "Unusual behavior pattern detected",
    };

    return descriptions[type] || `${type} alert detected`;
  }
}

// Create and export default instance
const alertService = new AlertService();

// Export the class for custom instances
export { AlertService };

// Export default instance
export default alertService;

// Convenience export for the main function
export const alertApi = alertService;
