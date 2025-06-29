import apiClient, { ApiResponse } from "@/utils/api-client";

// Exam interface
export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  maxScore: number;
  status: "draft" | "published" | "active" | "completed" | "archived";
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  subject?: string;
  level?: "beginner" | "intermediate" | "advanced";
  isProctored: boolean;
  allowRetake: boolean;
  maxRetakes: number;
  instructions?: string;
  settings?: {
    allowReview: boolean;
    showResults: boolean;
    randomizeQuestions: boolean;
    timeLimit: boolean;
    allowCalculator: boolean;
    allowNotes: boolean;
  };
}

// Exam with additional data
export interface ExamWithStats extends Exam {
  enrolledStudents: number;
  completedStudents: number;
  averageScore?: number;
  violations: number;
  lastActivity?: string;
}

// Create exam request
export interface CreateExamRequest {
  title: string;
  description?: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  maxScore: number;
  startTime?: string;
  endTime?: string;
  subject?: string;
  level?: "beginner" | "intermediate" | "advanced";
  isProctored: boolean;
  allowRetake: boolean;
  maxRetakes: number;
  instructions?: string;
  settings?: {
    allowReview: boolean;
    showResults: boolean;
    randomizeQuestions: boolean;
    timeLimit: boolean;
    allowCalculator: boolean;
    allowNotes: boolean;
  };
}

// Update exam request
export interface UpdateExamRequest {
  title?: string;
  description?: string;
  duration?: number;
  totalQuestions?: number;
  passingScore?: number;
  maxScore?: number;
  startTime?: string;
  endTime?: string;
  status?: "draft" | "published" | "active" | "completed" | "archived";
  subject?: string;
  level?: "beginner" | "intermediate" | "advanced";
  isProctored?: boolean;
  allowRetake?: boolean;
  maxRetakes?: number;
  instructions?: string;
  settings?: {
    allowReview: boolean;
    showResults: boolean;
    randomizeQuestions: boolean;
    timeLimit: boolean;
    allowCalculator: boolean;
    allowNotes: boolean;
  };
}

// Exam list response
export interface ExamListResponse {
  exams: ExamWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Exam statistics
export interface ExamStats {
  totalExams: number;
  activeExams: number;
  completedExams: number;
  draftExams: number;
  totalStudents: number;
  totalViolations: number;
  averageScore: number;
}

// Exam service class
class ExamService {
  private baseEndpoint = "api/exams";

  // Get exam list
  async getExamList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    subject?: string;
    level?: string;
    isProctored?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<ExamListResponse>> {
    return apiClient.get<ExamListResponse>(this.baseEndpoint, params);
  }

  // Get exam by ID
  async getExamById(examId: string): Promise<ApiResponse<ExamWithStats>> {
    return apiClient.get<ExamWithStats>(`${this.baseEndpoint}/${examId}`);
  }

  // Create new exam
  async createExam(examData: CreateExamRequest): Promise<ApiResponse<Exam>> {
    return apiClient.post<Exam>(this.baseEndpoint, examData);
  }

  // Update exam
  async updateExam(
    examId: string,
    updateData: UpdateExamRequest
  ): Promise<ApiResponse<Exam>> {
    return apiClient.put<Exam>(`${this.baseEndpoint}/${examId}`, updateData);
  }

  // Delete exam
  async deleteExam(examId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${examId}`);
  }

  // Publish exam
  async publishExam(examId: string): Promise<ApiResponse<Exam>> {
    return apiClient.patch<Exam>(`${this.baseEndpoint}/${examId}/publish`);
  }

  // Activate exam
  async activateExam(examId: string): Promise<ApiResponse<Exam>> {
    return apiClient.patch<Exam>(`${this.baseEndpoint}/${examId}/activate`);
  }

  // Deactivate exam
  async deactivateExam(examId: string): Promise<ApiResponse<Exam>> {
    return apiClient.patch<Exam>(`${this.baseEndpoint}/${examId}/deactivate`);
  }

  // Archive exam
  async archiveExam(examId: string): Promise<ApiResponse<Exam>> {
    return apiClient.patch<Exam>(`${this.baseEndpoint}/${examId}/archive`);
  }

  // Duplicate exam
  async duplicateExam(examId: string): Promise<ApiResponse<Exam>> {
    return apiClient.post<Exam>(`${this.baseEndpoint}/${examId}/duplicate`);
  }

  // Get exam statistics
  async getExamStats(): Promise<ApiResponse<ExamStats>> {
    return apiClient.get<ExamStats>(`${this.baseEndpoint}/stats`);
  }

  // Get exam analytics
  async getExamAnalytics(examId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseEndpoint}/${examId}/analytics`);
  }

  // Get exam results
  async getExamResults(
    examId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseEndpoint}/${examId}/results`, params);
  }

  // Export exam results
  async exportExamResults(
    examId: string,
    format: "csv" | "excel" = "csv"
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get(`${this.baseEndpoint}/${examId}/results/export`, {
      format,
    });
  }

  // Get exam questions
  async getExamQuestions(examId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseEndpoint}/${examId}/questions`);
  }

  // Add questions to exam
  async addQuestionsToExam(
    examId: string,
    questions: any[]
  ): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseEndpoint}/${examId}/questions`, {
      questions,
    });
  }

  // Remove questions from exam
  async removeQuestionsFromExam(
    examId: string,
    questionIds: string[]
  ): Promise<ApiResponse<void>> {
    return apiClient.post(`${this.baseEndpoint}/${examId}/questions/remove`, {
      questionIds,
    });
  }

  // Get exam settings
  async getExamSettings(examId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseEndpoint}/${examId}/settings`);
  }

  // Update exam settings
  async updateExamSettings(
    examId: string,
    settings: any
  ): Promise<ApiResponse<any>> {
    return apiClient.put(`${this.baseEndpoint}/${examId}/settings`, settings);
  }

  // Get exam schedule
  async getExamSchedule(params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.baseEndpoint}/schedule`, params);
  }
}

// Create and export default instance
const examService = new ExamService();

// Export the class for custom instances
export { ExamService };

// Export default instance
export default examService;

// Convenience functions for common operations
export const examApi = {
  // Get exam list
  getList: () => examService.getExamList(),

  // CRUD operations
  getById: (id: string) => examService.getExamById(id),
  create: (data: CreateExamRequest) => examService.createExam(data),
  update: (id: string, data: UpdateExamRequest) =>
    examService.updateExam(id, data),
  delete: (id: string) => examService.deleteExam(id),

  // Status operations
  publish: (id: string) => examService.publishExam(id),
  activate: (id: string) => examService.activateExam(id),
  deactivate: (id: string) => examService.deactivateExam(id),
  archive: (id: string) => examService.archiveExam(id),
  duplicate: (id: string) => examService.duplicateExam(id),

  // Analytics and results
  getStats: () => examService.getExamStats(),
  getAnalytics: (id: string) => examService.getExamAnalytics(id),
  getResults: (id: string, params?: any) =>
    examService.getExamResults(id, params),
  exportResults: (id: string, format?: "csv" | "excel") =>
    examService.exportExamResults(id, format),

  // Schedule
  getSchedule: (params?: any) => examService.getExamSchedule(params),
};
