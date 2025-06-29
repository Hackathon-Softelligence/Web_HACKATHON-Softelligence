// API Client configuration
const API_BASE_URL = "http://localhost:8085/api";

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// HTTP Methods
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Request configuration
export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  // Build URL with query parameters
  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildURL(endpoint, config.params);

      const requestConfig: RequestInit = {
        method: config.method,
        headers: {
          ...this.defaultHeaders,
          ...config.headers,
        },
      };

      if (config.body && config.method !== "GET") {
        requestConfig.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, requestConfig);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Create and export default instance
const apiClient = new ApiClient();

// Export the class for custom instances
export { ApiClient };

// Export default instance
export default apiClient;

// Convenience functions for common API calls
export const api = {
  // User endpoints
  users: {
    getProfile: () => apiClient.get("/users/profile"),
    updateProfile: (data: any) => apiClient.put("/users/profile", data),
    getUsers: (params?: Record<string, string | number | boolean>) =>
      apiClient.get("/users", params),
    getUserById: (id: string) => apiClient.get(`/users/${id}`),
  },

  // Exam endpoints
  exams: {
    getExams: (params?: Record<string, string | number | boolean>) =>
      apiClient.get("/exams", params),
    getExamById: (id: string) => apiClient.get(`/exams/${id}`),
    createExam: (examData: any) => apiClient.post("/exams", examData),
    updateExam: (id: string, examData: any) =>
      apiClient.put(`/exams/${id}`, examData),
    deleteExam: (id: string) => apiClient.delete(`/exams/${id}`),
  },

  // Proctoring endpoints
  proctoring: {
    startSession: (examId: string) =>
      apiClient.post(`/proctoring/sessions`, { examId }),
    endSession: (sessionId: string) =>
      apiClient.put(`/proctoring/sessions/${sessionId}/end`),
    getSession: (sessionId: string) =>
      apiClient.get(`/proctoring/sessions/${sessionId}`),
    uploadEvidence: (sessionId: string, evidence: any) =>
      apiClient.post(`/proctoring/sessions/${sessionId}/evidence`, evidence),
  },

  // Dashboard endpoints
  dashboard: {
    getStats: () => apiClient.get("/dashboard/stats"),
    getRecentActivity: (params?: Record<string, string | number | boolean>) =>
      apiClient.get("/dashboard/activity", params),
  },
};

// Hook for using API client with React
export const useApiClient = () => {
  return {
    client: apiClient,
    api,
  };
};
