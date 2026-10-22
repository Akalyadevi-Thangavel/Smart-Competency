import {
  User, Profile, CareerRole, Skill, SkillGapItem,
  Assessment, Question, AssessmentResult, LearningItem,
  CodingProblem, InterviewQuestion, Project, PlacementReadiness,
  DailyTask, Achievement, Notification
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('smart_competency_token');
  }

  setToken(token: string) {
    localStorage.setItem('smart_competency_token', token);
  }

  clearToken() {
    localStorage.removeItem('smart_competency_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // ================= Auth =================
  async login(email: string, password: string): Promise<{ token: string; user: User; profile: Profile }> {
    const data = await this.request<{ token: string; user: User; profile: Profile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(payload: { email: string; password: string; fullName: string; college?: string; targetRoleId?: string }): Promise<{ token: string; user: User; profile: Profile }> {
    const data = await this.request<{ token: string; user: User; profile: Profile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  async demoLogin(role: 'student' | 'admin' = 'student'): Promise<{ token: string; user: User; profile: Profile }> {
    const data = await this.request<{ token: string; user: User; profile: Profile }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe(): Promise<{ user: User; profile: Profile }> {
    return this.request<{ user: User; profile: Profile }>('/auth/me');
  }

  // ================= User & Dashboard =================
  async getDashboard(): Promise<any> {
    return this.request<any>('/user/dashboard');
  }

  async getProfile(): Promise<Profile> {
    return this.request<Profile>('/user/profile');
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ message: string; profile: Profile }> {
    return this.request<{ message: string; profile: Profile }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async submitOnboarding(data: any): Promise<{ message: string; profile: Profile }> {
    return this.request<{ message: string; profile: Profile }>('/user/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDailyTasks(): Promise<DailyTask[]> {
    return this.request<DailyTask[]>('/user/daily-tasks');
  }

  async toggleDailyTask(taskId: string): Promise<{ is_completed: number }> {
    return this.request<{ is_completed: number }>(`/user/daily-tasks/${taskId}/toggle`, {
      method: 'POST',
    });
  }

  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/user/notifications');
  }

  async markNotificationRead(notifId: string): Promise<any> {
    return this.request(`/user/notifications/${notifId}/read`, {
      method: 'POST',
    });
  }

  // ================= Assessments =================
  async getAssessments(): Promise<Assessment[]> {
    return this.request<Assessment[]>('/assessments');
  }

  async getAssessmentById(id: string): Promise<{ assessment: Assessment; questions: Question[] }> {
    return this.request<{ assessment: Assessment; questions: Question[] }>(`/assessments/${id}`);
  }

  async submitAssessment(id: string, answers: Record<string, any>, timeSpentSeconds: number): Promise<AssessmentResult> {
    return this.request<AssessmentResult>(`/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeSpentSeconds }),
    });
  }

  async getAssessmentAttempts(): Promise<any[]> {
    return this.request<any[]>('/assessments/attempts/history');
  }

  // ================= Skills & Gaps =================
  async getSkillMatrix(): Promise<{ skills: Skill[]; categorized: Record<string, Skill[]>; totalSkills: number; assessedSkills: number }> {
    return this.request<any>('/skills/matrix');
  }

  async getSkillGaps(): Promise<SkillGapItem[]> {
    return this.request<SkillGapItem[]>('/skills/gaps');
  }

  async getSkillDetails(skillId: string): Promise<any> {
    return this.request<any>(`/skills/${skillId}`);
  }

  // ================= Career Roles =================
  async getRoles(): Promise<CareerRole[]> {
    return this.request<CareerRole[]>('/roles');
  }

  async getRoleMatches(): Promise<Array<{ role: CareerRole; compatibilityScore: number; status: string; matchingSkills: string[]; missingSkills: string[] }>> {
    return this.request<any[]>('/roles/match');
  }

  // ================= Learning Path =================
  async getLearningPath(): Promise<{ path: any; items: LearningItem[]; groupedByPhase: Record<string, LearningItem[]>; totalItems: number; completedItems: number; progressPercentage: number }> {
    return this.request<any>('/learning/path');
  }

  async toggleLearningItem(itemId: string): Promise<{ is_completed: number; completedItems: number }> {
    return this.request<any>(`/learning/item/${itemId}/toggle`, {
      method: 'POST',
    });
  }

  // ================= Resume =================
  async getLatestResume(): Promise<{ resume: any; analysis: any }> {
    return this.request<any>('/resume/latest');
  }

  async analyzeResume(resumeText: string, filename?: string): Promise<any> {
    return this.request<any>('/resume/analyze', {
      method: 'POST',
      body: JSON.stringify({ resumeText, filename }),
    });
  }

  // ================= Coding Lab =================
  async getCodingProblems(params: { difficulty?: string; topic?: string; search?: string } = {}): Promise<CodingProblem[]> {
    const query = new URLSearchParams();
    if (params.difficulty) query.append('difficulty', params.difficulty);
    if (params.topic) query.append('topic', params.topic);
    if (params.search) query.append('search', params.search);
    return this.request<CodingProblem[]>(`/coding/problems?${query.toString()}`);
  }

  async getCodingProblemById(id: string): Promise<CodingProblem> {
    return this.request<CodingProblem>(`/coding/problems/${id}`);
  }

  async runCode(problemId: string, code: string, language: string = 'javascript'): Promise<any> {
    return this.request<any>(`/coding/problems/${problemId}/run`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  }

  async submitCode(problemId: string, code: string, language: string = 'javascript'): Promise<any> {
    return this.request<any>(`/coding/problems/${problemId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ code, language }),
    });
  }

  async getCodingSubmissions(): Promise<any[]> {
    return this.request<any[]>('/coding/submissions');
  }

  // ================= Interview Prep =================
  async getInterviewQuestions(category?: string): Promise<InterviewQuestion[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<InterviewQuestion[]>(`/interview/questions${query}`);
  }

  async evaluateInterviewAnswer(questionId: string, studentAnswer: string): Promise<{ attemptId: string; evaluation: any }> {
    return this.request<any>('/interview/evaluate', {
      method: 'POST',
      body: JSON.stringify({ questionId, studentAnswer }),
    });
  }

  async getInterviewHistory(): Promise<any[]> {
    return this.request<any[]>('/interview/history');
  }

  // ================= Projects =================
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async createProject(projectData: Partial<Project>): Promise<{ message: string; project: Project }> {
    return this.request<{ message: string; project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<any> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // ================= Placement Readiness =================
  async getPlacementReadiness(): Promise<PlacementReadiness> {
    return this.request<PlacementReadiness>('/placement/readiness');
  }

  // ================= AI Career Coach =================
  async chatWithCoach(message: string, sessionId?: string): Promise<{ role: string; message: string; timestamp: string }> {
    return this.request<{ role: string; message: string; timestamp: string }>('/ai/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }

  async chatCoach(message: string, sessionId?: string): Promise<{ role: string; message: string; timestamp: string }> {
    return this.chatWithCoach(message, sessionId);
  }

  async getCoachHistory(sessionId?: string): Promise<any[]> {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return this.request<any[]>(`/ai/coach/history${query}`);
  }

  async clearCoachHistory(sessionId?: string): Promise<any> {
    const query = sessionId ? `?sessionId=${sessionId}` : '';
    return this.request(`/ai/coach/history${query}`, {
      method: 'DELETE',
    });
  }

  // ================= Leaderboard =================
  async getLeaderboard(): Promise<any[]> {
    return this.request<any[]>('/leaderboard');
  }

  // ================= Admin =================
  async getAdminOverview(): Promise<any> {
    return this.request<any>('/admin/overview');
  }

  async getAdminStudents(params: { search?: string; role?: string; branch?: string } = {}): Promise<any[]> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.branch) query.append('branch', params.branch);
    return this.request<any[]>(`/admin/students?${query.toString()}`);
  }

  async createAdminQuestion(questionData: any): Promise<any> {
    return this.request('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }
}

export const api = new ApiClient();
