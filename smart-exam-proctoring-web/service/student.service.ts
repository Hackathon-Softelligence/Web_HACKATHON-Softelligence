import apiClient, { ApiResponse } from "@/utils/api-client";

// Student interface
export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

// Student in exam context
export interface StudentInExam extends Student {
  examId: string;
  examStatus: "not_started" | "in_progress" | "completed" | "disqualified";
  startTime?: string;
  endTime?: string;
  score?: number;
  proctoringStatus: "normal" | "warning" | "violation";
  lastActivity?: string;
}

// Create student request
export interface CreateStudentRequest {
  name: string;
  email: string;
  studentId: string;
  password?: string;
}

// Update student request
export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  studentId?: string;
  status?: "active" | "inactive" | "suspended";
}

// Student list response
export interface StudentListResponse {
  students: StudentInExam[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Student service class
class StudentService {
  private baseEndpoint = "/students";

  // Get student list by exam ID
  async getStudentListByExamId(
    examId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      proctoringStatus?: string;
    }
  ): Promise<ApiResponse<StudentListResponse>> {
    return apiClient.get<StudentListResponse>(
      `/exams/${examId}/students`,
      params
    );
  }

  // Get all students
  async getAllStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<StudentListResponse>> {
    return apiClient.get<StudentListResponse>(this.baseEndpoint, params);
  }

  // Get student by ID
  async getStudentById(studentId: string): Promise<ApiResponse<Student>> {
    return apiClient.get<Student>(`${this.baseEndpoint}/${studentId}`);
  }

  // Create new student
  async createStudent(
    studentData: CreateStudentRequest
  ): Promise<ApiResponse<Student>> {
    return apiClient.post<Student>(this.baseEndpoint, studentData);
  }

  // Update student
  async updateStudent(
    studentId: string,
    updateData: UpdateStudentRequest
  ): Promise<ApiResponse<Student>> {
    return apiClient.put<Student>(
      `${this.baseEndpoint}/${studentId}`,
      updateData
    );
  }

  // Delete student
  async deleteStudent(studentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseEndpoint}/${studentId}`);
  }

  // Get student profile
  async getStudentProfile(): Promise<ApiResponse<Student>> {
    return apiClient.get<Student>(`${this.baseEndpoint}/profile`);
  }

  // Update student profile
  async updateStudentProfile(
    updateData: UpdateStudentRequest
  ): Promise<ApiResponse<Student>> {
    return apiClient.put<Student>(`${this.baseEndpoint}/profile`, updateData);
  }

  // Enroll student to exam
  async enrollStudentToExam(
    studentId: string,
    examId: string
  ): Promise<ApiResponse<StudentInExam>> {
    return apiClient.post<StudentInExam>(`/exams/${examId}/students`, {
      studentId,
    });
  }

  // Remove student from exam
  async removeStudentFromExam(
    studentId: string,
    examId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/exams/${examId}/students/${studentId}`);
  }

  // Get student exam status
  async getStudentExamStatus(
    studentId: string,
    examId: string
  ): Promise<ApiResponse<StudentInExam>> {
    return apiClient.get<StudentInExam>(
      `/exams/${examId}/students/${studentId}`
    );
  }

  // Update student exam status
  async updateStudentExamStatus(
    studentId: string,
    examId: string,
    status: {
      examStatus?: "not_started" | "in_progress" | "completed" | "disqualified";
      proctoringStatus?: "normal" | "warning" | "violation";
      score?: number;
    }
  ): Promise<ApiResponse<StudentInExam>> {
    return apiClient.patch<StudentInExam>(
      `/exams/${examId}/students/${studentId}`,
      status
    );
  }

  // Bulk operations
  async bulkEnrollStudents(
    examId: string,
    studentIds: string[]
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    return apiClient.post(`/exams/${examId}/students/bulk-enroll`, {
      studentIds,
    });
  }

  // Export students
  async exportStudentsByExam(
    examId: string,
    format: "csv" | "excel" = "csv"
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get(`/exams/${examId}/students/export`, { format });
  }
}

// Create and export default instance
const studentService = new StudentService();

// Export the class for custom instances
export { StudentService };

// Export default instance
export default studentService;

// Convenience functions for common operations
export const studentApi = {
  // Get students by exam
  getByExam: (examId: string, params?: any) =>
    studentService.getStudentListByExamId(examId, params),

  // CRUD operations
  getAll: (params?: any) => studentService.getAllStudents(params),
  getById: (id: string) => studentService.getStudentById(id),
  create: (data: CreateStudentRequest) => studentService.createStudent(data),
  update: (id: string, data: UpdateStudentRequest) =>
    studentService.updateStudent(id, data),
  delete: (id: string) => studentService.deleteStudent(id),

  // Profile operations
  getProfile: () => studentService.getStudentProfile(),
  updateProfile: (data: UpdateStudentRequest) =>
    studentService.updateStudentProfile(data),

  // Exam status
  getExamStatus: (studentId: string, examId: string) =>
    studentService.getStudentExamStatus(studentId, examId),
  updateExamStatus: (studentId: string, examId: string, status: any) =>
    studentService.updateStudentExamStatus(studentId, examId, status),

  // Export
  exportByExam: (examId: string, format?: "csv" | "excel") =>
    studentService.exportStudentsByExam(examId, format),
};
