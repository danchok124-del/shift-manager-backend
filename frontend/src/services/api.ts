import { Attendance, PaginatedResponse, User } from '../types';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }


  logout() {
    this.setToken(null);
  }

  // Users
  async getUsers(params?: { search?: string; departmentId?: number; role?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.departmentId) query.set('departmentId', String(params.departmentId));
    if (params?.role) query.set('role', params.role);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<any>(`/users?${query}`);
  }

  async getUser(id: number) {
    return this.request<any>(`/users/${id}`);
  }

  async getMe() {
    return this.request<any>('/users/me');
  }

  async updateUser(id: number, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserSchedule(id: number, startDate: string, endDate: string) {
    return this.request<any>(`/users/${id}/schedule?startDate=${startDate}&endDate=${endDate}`);
  }

  async getUserReport(id: number, month: number, year: number) {
    return this.request<any>(`/users/${id}/report?month=${month}&year=${year}`);
  }

  // Departments
  async getDepartments(params?: { search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<any>(`/departments?${query}`);
  }

  async getDepartment(id: number) {
    return this.request<any>(`/departments/${id}`);
  }

  async getDepartmentUsers(id: number) {
    return this.request<any>(`/departments/${id}/users`);
  }

  async createDepartment(data: { name: string; description?: string }) {
    return this.request<any>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: number, data: any) {
    return this.request<any>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: number) {
    return this.request<any>(`/departments/${id}`, { method: 'DELETE' });
  }

  async addUserToDepartment(departmentId: number, userId: number) {
    return this.request<any>(`/departments/${departmentId}/users`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeUserFromDepartment(departmentId: number, userId: number) {
    return this.request<any>(`/departments/${departmentId}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Shifts
  async getShifts(params?: { departmentId?: number; isPublic?: boolean; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.departmentId) query.set('departmentId', String(params.departmentId));
    if (params?.isPublic !== undefined) query.set('isPublic', String(params.isPublic));
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<any>(`/shifts?${query}`);
  }

  async getPublicShifts(params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<any>(`/shifts/public?${query}`);
  }

  async getShift(id: number) {
    return this.request<any>(`/shifts/${id}`);
  }

  async createShift(data: any) {
    return this.request<any>('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShift(id: number, data: any) {
    return this.request<any>(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteShift(id: number) {
    return this.request<any>(`/shifts/${id}`, { method: 'DELETE' });
  }

  async assignToShift(shiftId: number, userId?: number) {
    return this.request<any>(`/shifts/${shiftId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeFromShift(shiftId: number, userId: number) {
    return this.request<any>(`/shifts/${shiftId}/assign/${userId}`, {
      method: 'DELETE',
    });
  }

  // Attendance
  async getMyAttendance(params?: { month?: number; year?: number; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', String(params.month));
    if (params?.year) query.set('year', String(params.year));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<PaginatedResponse<Attendance>>(`/attendance/my?${query}`);
  }

  async getAttendance(params?: { departmentId?: number; userId?: number; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.departmentId) query.set('departmentId', String(params.departmentId));
    if (params?.userId) query.set('userId', String(params.userId));
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<PaginatedResponse<Attendance>>(`/attendance?${query}`);
  }

  async manualClockIn(shiftId?: number) {
    return this.request<Attendance>('/attendance/manual-clock-in', {
      method: 'POST',
      body: JSON.stringify({ shiftId }),
    });
  }

  async manualClockOut() {
    return this.request<Attendance & { hoursWorked: number }>('/attendance/manual-clock-out', {
      method: 'POST',
    });
  }

  // Skills
  async getSkills(params?: { search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<any>(`/skills?${query}`);
  }

  async createSkill(data: { name: string; description?: string }) {
    return this.request<any>('/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
